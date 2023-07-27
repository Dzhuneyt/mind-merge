'use client';

import {AppShell, Box, Container, Header, LoadingOverlay, Navbar, SimpleGrid, Text} from '@mantine/core';
import {FC, PropsWithChildren} from "react";
import {QuickDocCreatorField} from "@/components/QuickDocCreatorField";
import {gql, useQuery} from "@apollo/client";
import {useUser} from "@/hooks/useUser";
import {DocumentCard} from "@/app/docs/list/page";

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

const DiaryLayout: FC<PropsWithChildren> = ({children}) => (
    <AppShell
        padding="md"
        navbar={<Navbar width={{base: 300}} height={500} p="xs">
            <MyDocumentsList/>

            <div>
                <QuickDocCreatorField/>
            </div>
        </Navbar>}
        header={<Header height={60} p="xs">Doction</Header>}
        styles={(theme) => ({
            main: {backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0]},
        })}>
        {children}
    </AppShell>
);
export default DiaryLayout
