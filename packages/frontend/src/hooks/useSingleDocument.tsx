import {gql, useQuery} from "@apollo/client";
import {KBDocument} from "@/models/KBDocument";

export function useSingleDocument(id: string) {
    const QUERY = gql`
        query GetDocument($id: String!) {
            document(id: $id) {
                id
                title
                content
            }
        }
    `

    const {data, loading, error} = useQuery<{
        document: KBDocument,
    }>(QUERY, {
        variables: {
            id,
        }
    });
    return {
        data,
        loading,
        error
    }
}
