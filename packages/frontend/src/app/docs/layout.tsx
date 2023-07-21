'use client';

import {AppShell, Header, Navbar} from '@mantine/core';
import {FC, PropsWithChildren} from "react";
import {QuickDocCreatorField} from "@/components/QuickDocCreatorField";

const DiaryLayout: FC<PropsWithChildren> = ({children}) => (
    <AppShell
        padding="md"
        navbar={<Navbar width={{base: 300}} height={500} p="xs">
            My documents here

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
