import * as cdk from 'aws-cdk-lib';
import {Annotations, CfnOutput, Stack} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {UserPool, UserPoolEmail} from "aws-cdk-lib/aws-cognito";
import {IdentityPool, UserPoolAuthenticationProvider} from "@aws-cdk/aws-cognito-identitypool-alpha";
import {AuthorizationType, FieldLogLevel, GraphqlApi, UserPoolDefaultAction} from "aws-cdk-lib/aws-appsync";
import {RetentionDays} from "aws-cdk-lib/aws-logs";
import {CodeFirstSchema, Directive, GraphqlType, ObjectType, ResolvableField} from "awscdk-appsync-utils";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";
import * as lambda from "aws-cdk-lib/aws-lambda";
import {Runtime} from "aws-cdk-lib/aws-lambda";
import {IField} from "awscdk-appsync-utils/lib/schema-base";
import {AttributeType, BillingMode, Table} from "aws-cdk-lib/aws-dynamodb";
import {StringParameter} from "aws-cdk-lib/aws-ssm";
import {PolicyStatement} from "aws-cdk-lib/aws-iam";

class SchemaOperation extends Construct {

    constructor(scope: Construct, id: string, private props: {
        // GraphQL API to which to attach this operation and datasource (Lambda)
        api: GraphqlApi,

        // The schema which will be enriched with this operation and datatype
        schema: CodeFirstSchema,

        // The type of the operation, either 'query' or 'mutation'. Default: query
        operation?: 'query' | 'mutation',

        // If the response object is a single object or a list of objects
        isList?: boolean,

        // The field name, under which this operation will be available
        fieldName: string,

        // The response object definition for this operation
        fieldDefinition: {
            [key: string]: IField;
        },

        args?: {
            [key: string]: GraphqlType;
        },

        // The Lambda that will back this operation and compute the response
        lambda: lambda.Function,
    }) {
        super(scope, id);

        const operation = props.operation ?? 'query';
        const isList = !!props.isList;

        const DirectiveCognito = Directive.custom('@aws_cognito_user_pools')

        if (!props.fieldName.match(/^[a-zA-Z]+$/)) {
            Annotations.of(this).addError(`fieldName prop must be alphanumeric only, got: ${props.fieldName}`);
        }

        const DataType = props.schema.addType(new ObjectType(`${props.fieldName}ObjectType`, {
            definition: props.fieldDefinition,
            directives: [DirectiveCognito],
        }));

        const dataSource = props.api.addLambdaDataSource(`datasource-${props.fieldName}`, props.lambda)
        const returnType = DataType.attribute({isList})
        const directives = [DirectiveCognito];

        if (operation === 'mutation') {
            props.schema.addMutation(props.fieldName, new ResolvableField({
                returnType,
                dataSource,
                directives,
                args: props.args,
            }))
        } else {
            props.schema.addQuery(props.fieldName, new ResolvableField({
                returnType,
                dataSource,
                directives,
                args: props.args,
            }))
        }
    }
}

export class Doction extends cdk.Stack {
    private userPool: UserPool;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.createTables()
        this.createUserPool();
        this.createAppSyncApi();
    }

    private createUserPool() {
        this.userPool = new UserPool(this, 'UserPool', {
            selfSignUpEnabled: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            signInAliases: {
                email: true,
            },
            email: UserPoolEmail.withCognito(),
        })
        new CfnOutput(this.userPool, 'UserPoolId', {
            value: this.userPool.userPoolId,
        })

        const identityPool = new IdentityPool(this, 'IdentityPool', {
            authenticationProviders: {
                userPools: [new UserPoolAuthenticationProvider({userPool: this.userPool})],
            },
        });
        new CfnOutput(identityPool, 'IdentityPoolId', {
            value: identityPool.identityPoolId,
        })

        const userPoolClient = this.userPool.addClient('web', {
            authFlows: {
                userPassword: true,
                userSrp: true,
            },
        })
        new CfnOutput(userPoolClient, 'UserPoolClientId', {
            value: userPoolClient.userPoolClientId,
        })
    }

    private createAppSyncApi() {
        const schema = new CodeFirstSchema()

        const api = new GraphqlApi(this, 'GraphqlApi', {
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: AuthorizationType.USER_POOL,
                    userPoolConfig: {
                        userPool: this.userPool,
                        defaultAction: UserPoolDefaultAction.ALLOW,
                    },
                },
            },
            name: `${Stack.of(this).stackName}-GraphqlApi`,
            schema,
            logConfig: {
                fieldLogLevel: FieldLogLevel.ALL,
                retention: RetentionDays.ONE_WEEK,
                excludeVerboseContent: true,
            },
        });

        new SchemaOperation(this, 'Query-ListDocuments', {
            api,
            schema,
            operation: 'query',
            fieldName: 'documents',
            isList: true,
            fieldDefinition: {
                id: GraphqlType.id(),
                title: GraphqlType.string(),
                content: GraphqlType.string(),
                createdAt: GraphqlType.string(),
                updatedAt: GraphqlType.string(),
            },
            lambda: new NodejsFunction(this, './lambda/listDocuments.ts', {
                entry: path.resolve(__dirname, './lambda/listDocuments.ts'),
                runtime: Runtime.NODEJS_18_X,
                initialPolicy: [
                    new PolicyStatement({
                        actions: ['dynamodb:Scan'],
                        resources: ['*'], // TODO: Refine to include only table names from this stack
                    })
                ],
            }),
        })

        new SchemaOperation(this, 'Mutation-AddDocument', {
            api,
            schema,
            operation: 'mutation',
            fieldName: 'addDocument',
            isList: false,
            fieldDefinition: {
                id: GraphqlType.id(),
            },
            args: {
                title: GraphqlType.string(),
            },
            lambda: new NodejsFunction(this, './lambda/addDocument.ts', {
                entry: path.resolve(__dirname, './lambda/addDocument.ts'),
                runtime: Runtime.NODEJS_18_X,
                environment: {
                    TABLE_NAME_DOCUMENTS: `${Stack.of(this).stackName}-Documents`,
                },
                initialPolicy: [
                    new PolicyStatement({
                        actions: ['dynamodb:PutItem'],
                        resources: ['*'],
                    })
                ],
            }),
        })

        new CfnOutput(api, 'GraphqlApiUrl', {
            value: api.graphqlUrl,
        })
    }

    private createTables() {
        const TABLE_NAME = 'Documents';
        const table = new Table(this, TABLE_NAME, {
            tableName: `${Stack.of(this).stackName}-Documents`,
            partitionKey: {
                name: 'id',
                type: AttributeType.STRING,
            },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            billingMode: BillingMode.PAY_PER_REQUEST,
        })
        table.addGlobalSecondaryIndex({
            indexName: 'idUser',
            partitionKey: {
                name: 'idUser',
                type: AttributeType.STRING,
            },
        })
        new StringParameter(table, 'StringParameter', {
            parameterName: '/Doction/Documents/TableName',
            stringValue: table.tableName,
        })
    }
}
