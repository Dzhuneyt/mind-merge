import {DynamoDB} from "@aws-sdk/client-dynamodb";
import {unmarshall} from "@aws-sdk/util-dynamodb";

export const handler = async (event: any) => {
    const queryResult = await new DynamoDB({}).scan({
        TableName: 'Doction-Documents',
    })

    const items = (queryResult.Items ?? []).map(x => unmarshall(x))

    items.reverse();

    return items.reverse().map(item => ({
        id: item.id,
        title: item.title,
        created_at: item.created_at,
    }))
}
