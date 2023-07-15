import * as cdk from 'aws-cdk-lib';
import {CfnOutput} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {UserPool, UserPoolEmail} from "aws-cdk-lib/aws-cognito";
import {IdentityPool, UserPoolAuthenticationProvider} from "@aws-cdk/aws-cognito-identitypool-alpha";
import {FieldLogLevel, GraphqlApi} from "aws-cdk-lib/aws-appsync";
import {RetentionDays} from "aws-cdk-lib/aws-logs";
import {CodeFirstSchema, GraphqlType, ObjectType} from "awscdk-appsync-utils";

export class Doction extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.createUserPool();
        this.createAppSyncApi();
    }

    private createUserPool() {
        const userPool = new UserPool(this, 'UserPool', {
            selfSignUpEnabled: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            signInAliases: {
                email: true,
            },
            email: UserPoolEmail.withCognito(),
        })
        new CfnOutput(userPool, 'UserPoolId', {
            value: userPool.userPoolId,
        })

        const identityPool = new IdentityPool(this, 'IdentityPool', {
            authenticationProviders: {
                userPools: [new UserPoolAuthenticationProvider({userPool})],
            },
        });
        new CfnOutput(identityPool, 'IdentityPoolId', {
            value: identityPool.identityPoolId,
        })

        const userPoolClient = userPool.addClient('web', {
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

        schema.addType(new ObjectType('demo', {
            definition: {id: GraphqlType.id()},
        }));
        schema.addType(new ObjectType('Query', {
            definition: {},
        }));

        new GraphqlApi(this, 'api', {
            authorizationConfig: {},
            name: 'GraphqlApi',
            schema,
            logConfig: {
                fieldLogLevel: FieldLogLevel.ALL,
                retention: RetentionDays.ONE_WEEK,
                excludeVerboseContent: true,
            },
        });
    }
}
