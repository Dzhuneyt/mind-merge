'use client';

import {Anchor, AppShell, Box, Header, LoadingOverlay, Navbar, NavLink, Text} from '@mantine/core';
import React, {FC, PropsWithChildren} from "react";
import {NewArticleButton} from "@/components/NewArticleButton";
import {gql, useQuery} from "@apollo/client";
import {useUser} from "@/hooks/useUser";
import Link from "next/link";
import {IconArticle} from '@tabler/icons-react';
import {KBDocument} from "@/models/KBDocument";

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
        documents: ReadonlyArray<KBDocument>,

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
                <Anchor href={`/docs/view/${doc.id}`} component={Link} key={doc.id}>
                    <NavLink label={doc.title}
                             icon={<IconArticle size="1rem"
                                                stroke={1.5}/>}/>
                </Anchor>
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
        header={<Header height={60} p="xs">
            <Anchor href={'/'} component={Link}>
                MindMerge
            </Anchor>
        </Header>}
        styles={(theme) => ({
            main: {backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0]},
        })}>
        {children}
    </AppShell>
);
export default DocsLayout
