'use client';

import {useEffect} from "react";
import {useUser} from "@/hooks/useUser";
import apolloClient from "@/graphql/apolloClient";
import {gql, useQuery} from "@apollo/client";

const DiaryList = () => {
    const QUERY = gql`
        query MyQuery {
            documents {
                id
            }
        }
    `
    const {data, loading, error} = useQuery(QUERY);

    return "My documents list"
}
export default DiaryList
