import {KBDocument} from "@/models/KBDocument";
import {AspectRatio, BackgroundImage, Card, Text} from "@mantine/core";
import Link from "next/link";

export const DocumentCard = (props: { doc: KBDocument }) => <Card p="md"
                                                                  radius="md"
                                                                  component={Link}
                                                                  href={`/docs/view/${props.doc.id}`}
                                                                  className={""}>
    <AspectRatio ratio={1920 / 1080}>
        <BackgroundImage
            src="https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=720&q=80"
            radius="sm"
        ></BackgroundImage>
    </AspectRatio>
    <Text className={""} mt={5}>
        {props.doc.title}
    </Text>

</Card>
