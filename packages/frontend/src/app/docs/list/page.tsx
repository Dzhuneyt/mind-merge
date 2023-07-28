'use client';

import {gql, useQuery} from "@apollo/client";
import {Box, Container, LoadingOverlay, SimpleGrid, Text} from "@mantine/core";
import {KBDocument} from "@/models/KBDocument";
import {DocumentCard} from "@/components/DocumentCard";

const DocumentsList = () => {
    const QUERY = gql`
        query MyQuery {
            documents {
                id
                title
            }
        }
    `

    const {data, loading, error} = useQuery<{
        documents: ReadonlyArray<KBDocument>,
    }>(QUERY);

    if (loading) {
        return <Box py="xl">
            <LoadingOverlay visible={true}/>
        </Box>
    }

    if (error) {
        return <Box py="xl">
            <Text size="xl" weight={700} align="center">Error loading documents</Text>
            <Text size="xl" weight={700} align="center">{error.message}</Text>
        </Box>
    }

    if (!data?.documents.length) {
        return <Box py="xl">
            <p>
                No articles available yet
            </p>
        </Box>
    }

    return <Container py="xl">
        <SimpleGrid cols={2} breakpoints={[{maxWidth: 'sm', cols: 1}]}>
            {data?.documents.map((doc) =>
                <DocumentCard key={doc.id} doc={doc}/>)}
        </SimpleGrid>
    </Container>
}
export default DocumentsList
