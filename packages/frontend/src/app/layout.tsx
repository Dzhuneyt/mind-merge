'use client';

import './globals.css'
import {Inter} from 'next/font/google'
import {MantineProvider} from '@mantine/core';
import {Amplify} from "aws-amplify";


const inter = Inter({subsets: ['latin']})

Amplify.configure({});

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <MantineProvider withGlobalStyles withNormalizeCSS>
            {children}
        </MantineProvider>
        </body>
        </html>
    )
}
