import {DynamoDBClient, PutItemCommand} from "@aws-sdk/client-dynamodb"; // ES Modules import
import {monotonicFactory} from "ulid";

export const handler = async (event: any) => {
    const title = event.arguments.title as string;
    const idAuthor = event.identity.claims.sub as string;

    const uuid = monotonicFactory()
    const id = uuid();
    const client = new DynamoDBClient({});
    await client.send(new PutItemCommand({
        TableName: process.env.TABLE_NAME_DOCUMENTS as string,
        Item: {
            id: {S: id},
            title: {S: title},
            idAuthor: {S: idAuthor},
            created_at: {N: `${Math.round(Date.now() / 1000)}`},
        },
    }))
    return {id};
}
