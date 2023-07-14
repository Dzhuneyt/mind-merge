'use client';

import './globals.css'
import {Inter} from 'next/font/google'
import {MantineProvider} from '@mantine/core';
import {Amplify} from "aws-amplify";
import {Notifications} from "@mantine/notifications";


const inter = Inter({subsets: ['latin']})

Amplify.configure({
    Auth: {
        identityPoolId: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID,
        region: process.env.NEXT_PUBLIC_COGNITO_REGION,
        userPoolId: process.env.NEXT_PUBLIC_COGNITO_USERPOOL_ID,
        userPoolWebClientId: process.env.NEXT_PUBLIC_COGNITO_USERPOOL_CLIENT_ID,
    }
});

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <MantineProvider withGlobalStyles withNormalizeCSS>
            <Notifications/>
            {children}
        </MantineProvider>
        </body>
        </html>
    )
}
