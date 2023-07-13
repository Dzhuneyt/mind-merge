import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {UserPool} from "aws-cdk-lib/aws-cognito";
import {CfnOutput} from "aws-cdk-lib";
import {IdentityPool, UserPoolAuthenticationProvider} from "@aws-cdk/aws-cognito-identitypool-alpha";

export class Doction extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const userPool = new UserPool(this, 'UserPool', {
            selfSignUpEnabled: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        })
        const identityPool = new IdentityPool(this, 'IdentityPool', {
            authenticationProviders: {
                userPools: [new UserPoolAuthenticationProvider({userPool})],
            },
        });
        new CfnOutput(identityPool, 'IdentityPoolId', {
            value: identityPool.identityPoolId,
        })

        new CfnOutput(userPool, 'UserPoolId', {
            value: userPool.userPoolId,
        })
    }
}