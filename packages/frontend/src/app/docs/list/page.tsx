'use client';

import {gql, useQuery} from "@apollo/client";

const DocumentsList = () => {
    const QUERY = gql`
        query MyQuery {
            documents {
                id
            }
        }
    `
    const {data, loading, error} = useQuery(QUERY);
    console.log(data, loading, error)

    return "My documents list"
}
export default DocumentsList
