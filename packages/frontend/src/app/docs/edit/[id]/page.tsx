'use client';
import {useForm} from "@mantine/form";
import {Box, Button, Group, Textarea, TextInput} from "@mantine/core";

const EditPage = () => {
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
