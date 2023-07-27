import {FC, useEffect, useState} from "react";
import {Button, Flex, LoadingOverlay, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {gql, useMutation} from "@apollo/client";
import {useRouter} from "next/navigation";
import {showNotification} from "@mantine/notifications";

const MUTATION = gql`
    mutation AddDocument($title: String!) {
        addDocument(title: $title) {
            id
        }
    }
`
const Form: FC<{
    onCancel: () => void;
}> = (props) => {
    const form = useForm({
        initialValues: {
            title: '',
        },

        validate: {
            title: (value) => (value ? null : 'Title is required'),
        },
    });
    const router = useRouter();

    const [mutateFunction, {data, loading, error}] = useMutation<{
        addDocument: {
            id: string,
        },
    }>(MUTATION);

    useEffect(() => {
        const id = data?.addDocument.id;
        if (!id) {
            return;
        }
        router.push(`/docs/edit/${id}`);
    }, [data?.addDocument.id, router])

    if (loading) {
        return <div>
            <LoadingOverlay visible={true}/>
        </div>
    }

    if (error) {
        showNotification({
            title: 'Error creating document',
            message: error.message,
        })
    }

    return <form onSubmit={form.onSubmit((values) => {
        console.log(values)
        mutateFunction({
            variables: {
                title: values.title,
            }
        }).then(res => {
            console.log(res);
        })
    })}>
        <Flex direction={'column'} gap={'md'}>

            <TextInput
                withAsterisk
                placeholder="How to do X?"
                {...form.getInputProps('title')}
            />

            <Flex direction={'row'} gap={'md'} justify={'space-between'}>
                <Button onClick={() => props.onCancel()}>Cancel</Button>
                <Button type={"submit"}>Create</Button>
            </Flex>
        </Flex>
    </form>
}
export const NewArticleButton: FC = () => {
    const [formVisible, setFormVisible] = useState(false);

    if (!formVisible) {
        return <Button onClick={() => setFormVisible(true)}>Create a new article</Button>
    }

    return <Form onCancel={() => setFormVisible(false)}/>
}
