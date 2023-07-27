'use client';
import {useForm} from "@mantine/form";
import {Box, Button, Group, LoadingOverlay, Textarea, TextInput} from "@mantine/core";
import {gql, useQuery} from "@apollo/client";
import {useParams} from "next/navigation";
import {useEffect} from "react";

function useSingleDocument(id: string) {
    const QUERY = gql`
        query GetDocument($id: String!) {
            document(id: $id) {
                id
                title
            }
        }
    `

    const {data, loading, error} = useQuery<{
        document: Document,
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

const EditPage = () => {
    const params = useParams()
    const id = params.id

    const {data, loading, error} = useSingleDocument(id)

    console.log(data, loading, error);

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
    }, [data?.document.title]);

    if (loading) {
        return <Box>
            <LoadingOverlay visible={loading}/>
        </Box>
    }

    return (
        <Box mx="auto">
            <form onSubmit={form.onSubmit((values) => console.log(values))}>
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
