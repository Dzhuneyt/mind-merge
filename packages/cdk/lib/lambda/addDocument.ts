import {DynamoDBClient, PutItemCommand} from "@aws-sdk/client-dynamodb"; // ES Modules import
import {v4 as uuid} from 'uuid';

export const handler = async (event: any) => {
    const title = event.arguments.title as string;
    const idUser = event.identity.claims.sub as string;

    const id = uuid();
    const client = new DynamoDBClient({});
    await client.send(new PutItemCommand({
        TableName: process.env.TABLE_NAME_DOCUMENTS as string,
        Item: {
            id: {S: id},
            title: {S: title},
            idUser: {S: idUser},
        },
    }))
    return {id};
}
