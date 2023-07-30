import {KBDocument} from "@/models/KBDocument";
import {Accordion, Anchor, createStyles, rem} from "@mantine/core";
import ReactMarkdown from "react-markdown";
import {useUser} from "@/hooks/useUser";
import {useMemo} from "react";
import {IconEdit} from "@tabler/icons-react";
import Link from "next/link";


const useStyles = createStyles((theme) => ({
    item: {
        borderRadius: theme.radius.md,
        marginBottom: theme.spacing.lg,
        border: `${rem(1)} solid ${
            theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
        }`,
    },
}));

export const SingleDocumentPanel = (props: { doc: KBDocument }) => {
    const {classes} = useStyles();
    const user = useUser();
    const idUser = user.user?.getUsername();
    const idAuthor = props.doc.idAuthor;

    const createdAt = props.doc.created_at * 1000;
    const isMine = useMemo(() => idAuthor === idUser, [idUser, idAuthor]);

    return <>
        <Accordion.Item className={classes.item}
                        value={props.doc.id}>

            <Accordion.Control>{props.doc.title}</Accordion.Control>
            <Accordion.Panel>
                <ReactMarkdown>
                    {props.doc.content ?? ''}
                </ReactMarkdown>

                <hr/>

                <p>
                    <i>Published: {new Date(createdAt).toLocaleDateString()} {new Date(createdAt).toLocaleTimeString()}</i>
                </p>

                {isMine &&
                    <p><Anchor href={`/docs/edit/${props.doc.id}`} component={Link}><i><IconEdit/> Edit
                        article</i></Anchor>
                    </p>}
            </Accordion.Panel>
        </Accordion.Item>
    </>
}
