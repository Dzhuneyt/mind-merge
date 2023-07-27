import {DynamoDBClient, GetItemCommand} from "@aws-sdk/client-dynamodb"; // ES Modules import
import {unmarshall} from "@aws-sdk/util-dynamodb";

export const handler = async (event: any) => {
    const id = event.arguments.id as string;

    const client = new DynamoDBClient({});
    const item = await client.send(new GetItemCommand({
        TableName: process.env.TABLE_NAME_DOCUMENTS as string,
        Key: {
            id: {S: id},
        },
    }))

    if (!item.Item) {
        throw new Error('Document not found');
    }

    return unmarshall(item.Item);
}
