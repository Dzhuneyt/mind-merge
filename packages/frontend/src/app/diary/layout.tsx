'use client';

import {AppShell, Header, Navbar} from '@mantine/core';

export default function DiaryLayout({
                                        children,
                                    }: {
    children: React.ReactNode
}) {
    return (
        <AppShell
            padding="md"
            navbar={<Navbar width={{base: 300}} height={500} p="xs">
                Diary here
            </Navbar>}
            header={<Header height={60} p="xs">Docs Repository</Header>}
            styles={(theme) => ({
                main: {backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0]},
            })}
        >
            {children}
        </AppShell>
    )
}
