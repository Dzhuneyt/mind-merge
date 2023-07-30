import * as cdk from 'aws-cdk-lib';
import {CfnOutput, Stack} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {UserPool, UserPoolEmail} from "aws-cdk-lib/aws-cognito";
import {IdentityPool, UserPoolAuthenticationProvider} from "@aws-cdk/aws-cognito-identitypool-alpha";
import {AuthorizationType, FieldLogLevel, GraphqlApi, UserPoolDefaultAction} from "aws-cdk-lib/aws-appsync";
import {RetentionDays} from "aws-cdk-lib/aws-logs";
import {CodeFirstSchema, GraphqlType} from "awscdk-appsync-utils";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";
import {Runtime} from "aws-cdk-lib/aws-lambda";
import {AttributeType, BillingMode, Table} from "aws-cdk-lib/aws-dynamodb";
import {StringParameter} from "aws-cdk-lib/aws-ssm";
import {PolicyStatement} from "aws-cdk-lib/aws-iam";
import {SchemaOperation} from "./SchemaOperation";

export class MindMergeStack extends cdk.Stack {
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
                content: GraphqlType.string({isRequired: false}),
                created_at: GraphqlType.awsTimestamp({isRequired: true}),
                updated_at: GraphqlType.awsTimestamp({isRequired: false}),
                idAuthor: GraphqlType.string({isRequired: true}),
            },
            args: {
                // Can filter documents by author
                idAuthor: GraphqlType.string({isRequired: false}),
            },
            lambda: new NodejsFunction(this, './lambda/listDocuments.ts', {
                entry: path.resolve(__dirname, './lambda/listDocuments.ts'),
                runtime: Runtime.NODEJS_18_X,
                environment: {
                    TABLE_NAME_DOCUMENTS: `${Stack.of(this).stackName}-Documents`,
                },
                initialPolicy: [
                    new PolicyStatement({
                        actions: ['dynamodb:Scan'],
                        resources: ['*'], // TODO: Refine to include only table names from this stack
                    })
                ],
            }),
        })

        new SchemaOperation(this, 'Query-GetDocument', {
            api,
            schema,
            operation: 'query',
            fieldName: 'document',
            fieldDefinition: {
                id: GraphqlType.id({isRequired: true}),
                title: GraphqlType.string({isRequired: true}),
                content: GraphqlType.string(),
                createdAt: GraphqlType.string({isRequired: true}),
                updatedAt: GraphqlType.string(),
                idAuthor: GraphqlType.string({isRequired: true})
            },
            args: {
                id: GraphqlType.string({isRequired: true}),
            },
            lambda: new NodejsFunction(this, './lambda/getDocument.ts', {
                entry: path.resolve(__dirname, './lambda/getDocument.ts'),
                runtime: Runtime.NODEJS_18_X,
                environment: {
                    TABLE_NAME_DOCUMENTS: `${Stack.of(this).stackName}-Documents`,
                },
                initialPolicy: [
                    new PolicyStatement({
                        actions: ['dynamodb:GetItem'],
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
                id: GraphqlType.id({isRequired: true}),
            },
            args: {
                title: GraphqlType.string({isRequired: true}),
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

        new SchemaOperation(this, 'Mutation-UpdateDocument', {
            api,
            schema,
            operation: 'mutation',
            fieldName: 'updateDocument',
            isList: false,
            fieldDefinition: {
                id: GraphqlType.id({isRequired: true}),
            },
            args: {
                id: GraphqlType.string({isRequired: true}),
                title: GraphqlType.string({isRequired: true}),
                content: GraphqlType.string({isRequired: true}),
            },
            lambda: new NodejsFunction(this, './lambda/updateDocument.ts', {
                entry: path.resolve(__dirname, './lambda/updateDocument.ts'),
                runtime: Runtime.NODEJS_18_X,
                environment: {
                    TABLE_NAME_DOCUMENTS: `${Stack.of(this).stackName}-Documents`,
                },
                initialPolicy: [
                    new PolicyStatement({
                        actions: ['dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:GetItem'],
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
            tableName: `${Stack.of(this).stackName}-${TABLE_NAME}`,
            partitionKey: {
                name: 'id',
                type: AttributeType.STRING,
            },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            billingMode: BillingMode.PAY_PER_REQUEST,
        })
        table.addGlobalSecondaryIndex({
            indexName: 'idAuthor',
            partitionKey: {
                name: 'idAuthor',
                type: AttributeType.STRING,
            },
        })
        new StringParameter(table, 'StringParameter', {
            parameterName: `/${Stack.of(this).stackName}/${TABLE_NAME}/TableName`,
            stringValue: table.tableName,
        })
    }
}
