'use client';

import {gql, useQuery} from "@apollo/client";
import {Accordion, Box, Container, LoadingOverlay, Text, Title} from "@mantine/core";
import {KBDocument} from "@/models/KBDocument";
import {SingleDocumentPanel} from "@/components/SingleDocumentPanel";


const DocumentsList = () => {
    const QUERY = gql`
        query Query {
            documents {
                id
                title
                content
                created_at
                idAuthor
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
        <Title order={1} align="center" mb={'xl'}>Knowledge base</Title>
        <Accordion variant="separated">
            {data?.documents.map((doc) => <SingleDocumentPanel key={doc.id} doc={doc}/>)}
        </Accordion>
    </Container>
}
export default DocumentsList
