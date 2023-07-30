import {DynamoDB} from "@aws-sdk/client-dynamodb";
import {unmarshall} from "@aws-sdk/util-dynamodb";

export const handler = async (event: any) => {
    const idAuthor = event.arguments.idAuthor;

    const queryResult = await new DynamoDB({}).scan({
        TableName: `${process.env.TABLE_NAME_DOCUMENTS}`,
    })

    const items = (queryResult.Items ?? []).map(x => unmarshall(x))

    return items
        .filter(x => idAuthor ? x.idAuthor === idAuthor : true)
        .map(item => ({
            id: item.id,
            title: item.title,
            content: item.content,
            created_at: item.created_at,
            updated_at: item.updated_at,
            idAuthor: item.idAuthor,
        }))
}
