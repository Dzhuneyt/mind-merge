'use client';
import {Anchor, Button, createStyles, Paper, PasswordInput, rem, Text, TextInput, Title,} from '@mantine/core';
import {useForm} from "@mantine/form";
import Auth from '@aws-amplify/auth';
import {useCallback} from "react";
import {useRouter} from "next/navigation";
import {NextPage} from "next";

const useStyles = createStyles((theme) => ({
    wrapper: {
        minHeight: rem(900),
        backgroundSize: 'cover',
        backgroundImage:
            'url(https://images.unsplash.com/photo-1484242857719-4b9144542727?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1280&q=80)',
    },

    form: {
        borderRight: `${rem(1)} solid ${
            theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[3]
        }`,
        minHeight: rem(900),
        maxWidth: rem(450),
        paddingTop: rem(80),

        [theme.fn.smallerThan('sm')]: {
            maxWidth: '100%',
        },
    },

    title: {
        color: theme.colorScheme === 'dark' ? theme.white : theme.black,
        fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    },
}));

const Login: NextPage = () => {
    const {classes} = useStyles();
    const router = useRouter();

    const form = useForm({
        initialValues: {
            email: '',
            password: '',
        },

        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
        },
    });

    const login = useCallback(async (email: string, password: string) => {
        const auth = await Auth.signIn({
            username: email,
            password,
        })
        const uuid = auth.username
        if (uuid) {
            router.push('/docs/list')
        }
    }, [router])
    return (
        <div className={classes.wrapper}>
            <Paper className={classes.form} radius={0} p={30}>
                <Title order={2} className={classes.title} ta="center" mt="md" mb={50}>
                    Welcome back to Doction!
                </Title>

                <form onSubmit={form.onSubmit((values) => {
                    login(values.email, values.password).then()
                })}>
                    <TextInput withAsterisk
                               {...form.getInputProps('email')}
                               label="Email address"
                               placeholder="hello@gmail.com"
                               size="md"/>
                    <PasswordInput
                        withAsterisk
                        {...form.getInputProps('password')}
                        label="Password"
                        placeholder="Your password"
                        mt="md" size="md"/>
                    <Button fullWidth mt="xl" size="md" type={"submit"}>
                        Login
                    </Button>
                </form>

                <Text ta="center" mt="md">
                    Don&apos;t have an account?{' '}
                    <Anchor<'a'> href="#" weight={700} onClick={(_) => router.push('/auth/register')}>
                        Register
                    </Anchor>
                </Text>
            </Paper>
        </div>
    );
};

export default Login
