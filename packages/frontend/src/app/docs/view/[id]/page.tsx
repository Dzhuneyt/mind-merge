'use client';
import {Box, LoadingOverlay} from "@mantine/core";
import {useParams} from "next/navigation";
import ReactMarkdown from 'react-markdown'
import {useSingleDocument} from "@/hooks/useSingleDocument";

const ViewDocumentPage = () => {
    const params = useParams()
    const id = params.id

    const {data, loading, error} = useSingleDocument(id)

    if (loading) {
        return <Box>
            <LoadingOverlay visible={loading}/>
        </Box>
    }

    if (error) {
        return <Box>
            <p>{error.message}</p>
        </Box>
    }

    return (
        <Box mx="auto">
            <h1>{data?.document.title ?? ''}</h1>
            <ReactMarkdown>
                {data?.document.content ?? ''}
            </ReactMarkdown>
        </Box>
    );
}
export default ViewDocumentPage;
