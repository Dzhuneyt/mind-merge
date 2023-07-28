'use client';
import {useForm} from "@mantine/form";
import {Box, Button, Group, LoadingOverlay, Textarea, TextInput} from "@mantine/core";
import {gql, useMutation, useQuery} from "@apollo/client";
import {useParams} from "next/navigation";
import {useEffect} from "react";
import {showNotification} from "@mantine/notifications";
import {KBDocument} from "@/models/KBDocument";

function useSingleDocument(id: string) {
    const QUERY = gql`
        query GetDocument($id: String!) {
            document(id: $id) {
                id
                title
                content
            }
        }
    `

    const {data, loading, error} = useQuery<{
        document: KBDocument,
    }>(QUERY, {
        variables: {
            id,
        }
    });
    return {
        data,
        loading,
        error
    }
}

function useSingleDocumentUpdater(id: string) {
    const QUERY = gql`
        mutation Mutation($id: String!, $title: String!, $content: String!) {
            updateDocument(id: $id, title: $title, content: $content) {
                id
            }
        }
    `
    const [updateFn, {}] = useMutation(QUERY, {})

    return (props: {
        title: string,
        content: string,
    }) => {
        return updateFn({
            variables: {
                id,
                title: props.title,
                content: props.content,
            }
        });
    };
}

const EditPage = () => {
    const params = useParams()
    const id = params.id

    const {data, loading, error} = useSingleDocument(id)

    const updateDocument = useSingleDocumentUpdater(id)

    const form = useForm({
        initialValues: {
            title: '',
            content: '',
        },

        validate: {
            title: (value) => (!!value ? null : 'Title is required'),
            content: (value) => (!!value ? null : 'Content is required'),
        },
    });

    useEffect(() => {
        data?.document.title && form.setFieldValue('title', data.document.title);
        data?.document.content && form.setFieldValue('content', data.document.content);
    }, [data?.document, form.setFieldValue]);

    if (loading) {
        return <Box>
            <LoadingOverlay visible={loading}/>
        </Box>
    }

    return (
        <Box mx="auto">
            <form onSubmit={form.onSubmit(async (values) => {
                await updateDocument({
                    title: values.title,
                    content: values.content,
                });
                showNotification({
                    message: 'The article has been published!',
                })
            })}>
                <TextInput
                    withAsterisk
                    label="Title"
                    placeholder="My cool article"
                    {...form.getInputProps('title')}
                />
                <Textarea
                    withAsterisk
                    label="Content (Markdown)"
                    {...form.getInputProps('content')}
                />

                <Group position="right" mt="md">
                    <Button type="submit">Publish</Button>
                </Group>
            </form>
        </Box>
    );
}
export default EditPage;
