'use client';

import {AppShell, Box, Flex, Header, LoadingOverlay, Navbar, Text} from '@mantine/core';
import React, {FC, PropsWithChildren} from "react";
import {NewArticleButton} from "@/components/NewArticleButton";
import {gql, useQuery} from "@apollo/client";
import {useUser} from "@/hooks/useUser";

function NewspaperIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"/>
    </svg>
}

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
        <h3>My articles</h3>
        <Box>
            {data?.documents.map((doc) => <>
                <Flex key={doc.id} gap={'md'} align={'center'} direction={'row'}>
                    <Box w={30}><NewspaperIcon/></Box> {doc.title}</Flex>
            </>)}
        </Box>
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
        header={<Header height={60} p="xs">MindMerge - Sharing Knowledge</Header>}
        styles={(theme) => ({
            main: {backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0]},
        })}>
        {children}
    </AppShell>
);
export default DocsLayout
