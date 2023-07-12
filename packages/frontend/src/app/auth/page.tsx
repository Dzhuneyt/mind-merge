'use client'
import { WithAuthenticatorProps } from "@aws-amplify/ui-react";
import {Amplify} from "aws-amplify";

Amplify.configure({});

export function Login({ signOut, user }: WithAuthenticatorProps) {
    return (
        <>
            <h1>Hello {user?.username}</h1>
            <button onClick={signOut}>Sign out</button>
        </>
    );
}
export default Login;