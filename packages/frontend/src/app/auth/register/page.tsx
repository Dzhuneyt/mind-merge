'use client';
import {Anchor, Button, createStyles, Paper, PasswordInput, rem, Text, TextInput, Title,} from '@mantine/core';
import {useForm} from "@mantine/form";
import Auth from '@aws-amplify/auth';
import {FC, useCallback, useMemo, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {useRouter as useCurrentRoute} from 'next/router'

import {notifications} from "@mantine/notifications";

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

const Step1: FC<{}> = (props) => {
    const router = useRouter();

    const form = useForm({
        initialValues: {
            email: '',
            password: '',
        },

        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
            password: value => {
                if (value.length < 8) {
                    return 'Password must be at least 8 characters'
                }
                if (!/[A-Z]/.test(value)) {
                    return 'Password must contain at least one uppercase letter'
                }
                if (!/[a-z]/.test(value)) {
                    return 'Password must contain at least one lowercase letter'
                }
                if (!/[0-9]/.test(value)) {
                    return 'Password must contain at least one number'
                }
                return null
            }
        },
    });

    const register = useCallback(async (email: string, password: string) => {
        try {
            const r = await Auth.signUp({
                username: email,
                password,
                autoSignIn: {
                    enabled: true,
                },
                attributes: {
                    email,
                },
            })

            // props.onSuccess(email, password);
            router.push(`/auth/register?email=${encodeURIComponent(email)}`);
        } catch (e) {
            console.error(e);
            if ((e as string).toString().includes('UsernameExistsException')) {
                notifications.show({
                    message: 'Email already registered. Please, try logging in',
                })
            }
        }
    }, [])

    return (

        <>
            <form onSubmit={form.onSubmit((values) => {
                register(values.email, values.password).then()
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
                    Register
                </Button>
            </form>

            <Text ta="center" mt="md">
                Already have an account?{' '}
                <Anchor<'a'> href="#" weight={700} onClick={(event) => router.push('/auth/login')}>
                    Sign in
                </Anchor>
            </Text>
        </>
    );
}

const Step2: FC<{
    email: string,
}> = (props) => {
    const router = useRouter();

    const form = useForm({
        initialValues: {
            code: '',
        },

        validate: {
            code: (value) => value.length === 6 ? null : 'Invalid code',
        },
    });

    const otpComplete = useCallback(async (code: string) => {
        console.log(props.email)
        const r = await Auth.confirmSignUp(props.email, code)
        if (r === 'SUCCESS') {
            notifications.show({
                message: 'Registration successful! You can now log in',
            })
            router.push('/auth/login')
            return
        }
        console.error(r);
    }, [props.email, router])

    return (

        <>
            <p>
                We have sent you an email with a confirmation code. Please enter it below to confirm your account.
            </p>
            <form onSubmit={form.onSubmit((values) => {
                otpComplete(values.code).then()
            })}>
                <TextInput withAsterisk
                           {...form.getInputProps('code')}
                           label="Code, received via email"
                           placeholder="123456"
                           size="md"/>
                <Button fullWidth mt="xl" size="md" type={"submit"}>
                    Register
                </Button>
            </form>
        </>
    );
}

export function Register() {
    const {classes} = useStyles();
    const searchParams = useSearchParams()

    const email = searchParams.has('email') ? decodeURIComponent(searchParams.get('email') as string) : null
    return <>
        <div className={classes.wrapper}>
            <Paper className={classes.form} radius={0} p={30}>
                <Title order={2} className={classes.title} ta="center" mt="md" mb={50}>
                    Join Doction!
                </Title>
                {!email && <Step1/>}
                {email && <Step2 email={email}/>}
            </Paper>
        </div>
    </>
}

export default Register
