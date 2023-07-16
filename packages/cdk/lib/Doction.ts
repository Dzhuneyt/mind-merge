import * as cdk from 'aws-cdk-lib';
import {CfnOutput, Stack} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {UserPool, UserPoolEmail} from "aws-cdk-lib/aws-cognito";
import {IdentityPool, UserPoolAuthenticationProvider} from "@aws-cdk/aws-cognito-identitypool-alpha";
import {AuthorizationType, FieldLogLevel, GraphqlApi, UserPoolDefaultAction} from "aws-cdk-lib/aws-appsync";
import {RetentionDays} from "aws-cdk-lib/aws-logs";
import {CodeFirstSchema, Directive, GraphqlType, ObjectType, ResolvableField} from "awscdk-appsync-utils";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";
import {Runtime} from "aws-cdk-lib/aws-lambda";

export class Doction extends cdk.Stack {
    private userPool: UserPool;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

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

        const DirectiveCognito = Directive.custom('@aws_cognito_user_pools')

        const DocumentType = schema.addType(new ObjectType('Document', {
            definition: {id: GraphqlType.id()},
            directives: [DirectiveCognito]
        }));

        const api = new GraphqlApi(this, 'GraphqlApi', {
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: AuthorizationType.API_KEY,
                },
                additionalAuthorizationModes: [
                    {
                        authorizationType: AuthorizationType.USER_POOL,
                        userPoolConfig: {
                            userPool: this.userPool,
                            defaultAction: UserPoolDefaultAction.ALLOW,
                        },
                    }
                ],
            },
            name: `${Stack.of(this).stackName}-GraphqlApi`,
            schema,
            logConfig: {
                fieldLogLevel: FieldLogLevel.ALL,
                retention: RetentionDays.ONE_WEEK,
                excludeVerboseContent: true,
            },
        });

        const datasourceListDocuments = api.addLambdaDataSource('listDocuments', new NodejsFunction(this, 'fn-listDocuments.ts', {
            entry: path.resolve(__dirname, './lambda/listDocuments.ts'),
            runtime: Runtime.NODEJS_18_X,
        }))
        schema.addQuery('documents', new ResolvableField({
            returnType: DocumentType.attribute({isList: true}),
            dataSource: datasourceListDocuments,
            directives: [DirectiveCognito],
        }))

        new CfnOutput(api, 'GraphqlApiUrl', {
            value: api.graphqlUrl,
        })
    }
}
