'use client';

import {gql, useQuery} from "@apollo/client";
import {AspectRatio, BackgroundImage, Box, Card, Center, Container, LoadingOverlay, SimpleGrid} from "@mantine/core";
import {createStyles, Image, Text} from '@mantine/core';

type Document = {
    id: string,
    title: string,
}

const DocumentCard = (props: { doc: Document }) => <Card p="md" radius="md" component="a" href="#" className={""}>
    <AspectRatio ratio={1920 / 1080}>
        <BackgroundImage
            src="https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=720&q=80"
            radius="sm"
        ></BackgroundImage>
    </AspectRatio>
    <Text color="dimmed" size="xs" transform="uppercase" weight={700} mt="md">
        27 July, 2023
    </Text>
    <Text className={""} mt={5}>
        {props.doc.title}
    </Text>
</Card>;

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
        documents: ReadonlyArray<Document>,
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
            No documents yet
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
