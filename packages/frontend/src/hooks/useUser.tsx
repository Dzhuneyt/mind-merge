import {useEffect, useState} from "react";
import Auth from "@aws-amplify/auth";
import {Logger} from "aws-amplify";
import {Hub} from "@aws-amplify/core";
import {CognitoUser} from "amazon-cognito-identity-js";

export const useUser = () => {
    const [user, setUser] = useState<CognitoUser | undefined>()

    const attemptRestoreUser = () => {
        Auth.currentAuthenticatedUser().then((user: CognitoUser | undefined) => {
            setUser(user)
        })
    }
    // Restore user session, if any
    useEffect(() => {
        attemptRestoreUser()
    }, [])

    useEffect(() => {
        const logger = new Logger('My-Logger');

        return Hub.listen('auth', (data) => {
            console.log('hub', data.payload.event);
            switch (data.payload.event) {
                case 'signIn':
                    logger.info('user signed in');
                    attemptRestoreUser();
                    break;
                case 'autoSignIn':
                    logger.info('auto sign in successful');
                    attemptRestoreUser();
                    break;
                case 'signOut':
                    logger.info('user signed out');
                    attemptRestoreUser();
                    break;
            }
        });
    }, [])

    if (user) {
        return {
            user,
            idToken: user.getSignInUserSession()!.getIdToken().getJwtToken(),
        }
    }
    return {
        user: undefined,
        idToken: undefined,
    };
}
