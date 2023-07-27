'use client';

import {AppShell, Box, Container, Header, List, LoadingOverlay, Navbar, Text} from '@mantine/core';
import {FC, PropsWithChildren} from "react";
import {NewArticleButton} from "@/components/NewArticleButton";
import {gql, useQuery} from "@apollo/client";
import {useUser} from "@/hooks/useUser";

const MyDocumentsList: FC = () => {
    const user = useUser()
    const QUERY = gql`
        query MyQuery($idAuthor:String) {
            documents(idAuthor:$idAuthor){
                id
                title
            }
        }
    `


    const {data, loading, error} = useQuery<{
        documents: ReadonlyArray<Document>,

    }>(QUERY, {
        variables: {
            idAuthor: user.user?.getUsername(),
        }
    });

    if (loading) {
        return <Box py="xl">
            <LoadingOverlay visible={true}/>
        </Box>
    }

    if (error) {
        return <Box py="xl">
            <Text size="xl" weight={700} align="center">Error loading your content</Text>
            <Text size="xl" weight={700} align="center">{error.message}</Text>
        </Box>
    }

    if (!data?.documents.length) {
        return <></>
    }

    return <>
        <h3>My content</h3>
        <Container mx={'md'}>
            <List>
                {data?.documents.map((doc) => <>
                    <List.Item key={doc.id}> {doc.title}</List.Item>
                </>)}
            </List>
        </Container>
    </>
}

const DocsLayout: FC<PropsWithChildren> = ({children}) => (
    <AppShell
        padding="md"
        navbar={<Navbar width={{base: 300}} height={500} p="xs">
            <MyDocumentsList/>

            <br/>
            <NewArticleButton/>
        </Navbar>}
        header={<Header height={60} p="xs">Knowledge Base</Header>}
        styles={(theme) => ({
            main: {backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0]},
        })}>
        {children}
    </AppShell>
);
export default DocsLayout
