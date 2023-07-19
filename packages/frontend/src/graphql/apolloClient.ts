import {ApolloClient, createHttpLink, InMemoryCache} from "@apollo/client";
import {setContext} from "@apollo/client/link/context";
import Auth from "@aws-amplify/auth";
import {CognitoUser} from "amazon-cognito-identity-js";

const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_APPSYNC_URL,
});

const asyncAuthLink = setContext(
    (request, {headers}) => Auth.currentAuthenticatedUser()
        .then((user: CognitoUser | undefined) => {
            const token = user?.getSignInUserSession()?.getIdToken().getJwtToken();
            return {
                headers: {
                    ...headers,
                    authorization: token ? `Bearer ${token}` : "",
                }
            }
        }).catch(err => {
            console.error(err);
            return {
                headers: {
                    ...headers,
                }
            }
        })
);

const apolloClient = new ApolloClient({
    link: asyncAuthLink.concat(httpLink),
    cache: new InMemoryCache(),
});

export default apolloClient;
