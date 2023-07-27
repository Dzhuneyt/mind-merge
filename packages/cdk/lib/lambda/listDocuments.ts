import {DynamoDB} from "@aws-sdk/client-dynamodb";
import {unmarshall} from "@aws-sdk/util-dynamodb";

export const handler = async (event: any) => {
    const idAuthor = event.arguments.idAuthor;

    console.log('idAuthor', idAuthor);

    const queryResult = await new DynamoDB({}).scan({
        TableName: 'Doction-Documents',
    })

    const items = (queryResult.Items ?? []).map(x => unmarshall(x))

    return items.filter(x => {
        if (idAuthor) {
            return x.idAuthor === idAuthor
        }
        return true;
    }).map(item => ({
        id: item.id,
        title: item.title,
        created_at: item.created_at,
    }))
}
