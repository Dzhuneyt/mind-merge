import {DynamoDBClient, GetItemCommand, UpdateItemCommand} from "@aws-sdk/client-dynamodb"; // ES Modules import
import {unmarshall} from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({});

async function getCurrentDocument(id: string) {
    const document = await client.send(new GetItemCommand({
        TableName: process.env.TABLE_NAME_DOCUMENTS as string,
        Key: {
            id: {S: id},
        },
    }))
    return document.Item ? unmarshall(document.Item) : undefined;
}

async function updateDocument(id: string, props: {
    title: string; content: string,
}) {
    await client.send(new UpdateItemCommand({
        TableName: process.env.TABLE_NAME_DOCUMENTS as string,
        Key: {
            id: {S: id},
        },
        UpdateExpression: 'SET #title = :title, #content = :content',
        ExpressionAttributeValues: {
            ':title': {S: props.title},
            ':content': {S: props.content},
        },
        ExpressionAttributeNames: {
            '#title': 'title',
            '#content': 'content',
        }
    }))
    return true;
}

export const handler = async (event: any) => {
    const idAuthor = event.identity.claims.sub as string;

    const id = event.arguments.id as string;
    const title = event.arguments.title as string;
    const content = event.arguments.content as string;

    const document = await getCurrentDocument(id);

    if (!document || document.idAuthor !== idAuthor) {
        throw new Error(`Document with id ${id} not found`);
    }

    await updateDocument(id, {title, content})
    return {id};
}
