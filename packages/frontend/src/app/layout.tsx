'use client';

import './globals.css'
import {Inter} from 'next/font/google'
import {MantineProvider} from '@mantine/core';
import {Amplify, Logger} from "aws-amplify";
import {Notifications} from "@mantine/notifications";
import {useEffect} from "react";
import Auth from "@aws-amplify/auth";
import {Hub} from "@aws-amplify/core";
import {useRouter} from "next/navigation";
import {ApolloProvider} from "@apollo/client";
import apolloClient from "@/graphql/apolloClient";


const inter = Inter({subsets: ['latin']})

Amplify.configure({
    Auth: {
        identityPoolId: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID,
        region: process.env.NEXT_PUBLIC_COGNITO_REGION,
        userPoolId: process.env.NEXT_PUBLIC_COGNITO_USERPOOL_ID,
        userPoolWebClientId: process.env.NEXT_PUBLIC_COGNITO_USERPOOL_CLIENT_ID,
    }
});

const useAuthEvents = () => {
    const router = useRouter();

    useEffect(() => {
        const logger = new Logger('My-Logger');

        return Hub.listen('auth', (data) => {
            console.log('hub', data.payload.event);
            switch (data.payload.event) {
                case 'configured':
                    logger.info('the Auth module is configured');
                    break;
                case 'signIn':
                    logger.info('user signed in');
                    router.push('/');
                    break;
                case 'signIn_failure':
                    logger.error('user sign in failed');
                    break;
                case 'signUp':
                    logger.info('user signed up');
                    break;
                case 'signUp_failure':
                    logger.error('user sign up failed');
                    break;
                case 'confirmSignUp':
                    logger.info('user confirmation successful');
                    break;
                case 'completeNewPassword_failure':
                    logger.error('user did not complete new password flow');
                    break;
                case 'autoSignIn':
                    logger.info('auto sign in successful');
                    break;
                case 'autoSignIn_failure':
                    logger.error('auto sign in failed');
                    break;
                case 'forgotPassword':
                    logger.info('password recovery initiated');
                    break;
                case 'forgotPassword_failure':
                    logger.error('password recovery failed');
                    break;
                case 'forgotPasswordSubmit':
                    logger.info('password confirmation successful');
                    break;
                case 'forgotPasswordSubmit_failure':
                    logger.error('password confirmation failed');
                    break;
                case 'verify':
                    logger.info('TOTP token verification successful');
                    break;
                case 'tokenRefresh':
                    logger.info('token refresh succeeded');
                    break;
                case 'tokenRefresh_failure':
                    logger.error('token refresh failed');
                    break;
                case 'cognitoHostedUI':
                    logger.info('Cognito Hosted UI sign in successful');
                    break;
                case 'cognitoHostedUI_failure':
                    logger.error('Cognito Hosted UI sign in failed');
                    break;
                case 'customOAuthState':
                    logger.info('custom state returned from CognitoHosted UI');
                    break;
                case 'customState_failure':
                    logger.error('custom state failure');
                    break;
                case 'parsingCallbackUrl':
                    logger.info('Cognito Hosted UI OAuth url parsing initiated');
                    break;
                case 'userDeleted':
                    logger.info('user deletion successful');
                    break;
                case 'updateUserAttributes':
                    logger.info('user attributes update successful');
                    break;
                case 'updateUserAttributes_failure':
                    logger.info('user attributes update failed');
                    break;
                case 'signOut':
                    logger.info('user signed out');
                    break;
            }
        });
    }, [router])
}

const RootLayout = ({children}: {
    children: React.ReactNode
}) => {
    useEffect(() => {
        Auth.currentAuthenticatedUser()
            .then(user => console.log({user}))
    }, [])

    useAuthEvents();

    return (
        <html lang="en">
        <body className={inter.className}>
        <MantineProvider withGlobalStyles withNormalizeCSS>
            <Notifications/>
            <ApolloProvider client={apolloClient}>
                {children}
            </ApolloProvider>
        </MantineProvider>
        </body>
        </html>
    );
};
export default RootLayout
