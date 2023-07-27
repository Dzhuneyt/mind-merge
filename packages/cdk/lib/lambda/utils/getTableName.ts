import {GetParameterCommand, SSMClient} from "@aws-sdk/client-ssm";

export async function getTableName(name: string) {
    const SSMParameterName = `/Doction/${name}/TableName`;
    const client = new SSMClient({});
    const command = new GetParameterCommand({
        Name: SSMParameterName,
        WithDecryption: true,
    })
    const response = await client.send(command);
    if (response.Parameter?.Value) {
        throw new Error(`SSM Parameter ${SSMParameterName} not found`);
    }
    return response.Parameter?.Value as string;
}
