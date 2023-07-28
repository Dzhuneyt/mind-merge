import {KBDocument} from "@/models/KBDocument";
import {AspectRatio, BackgroundImage, Card, Text} from "@mantine/core";

export const DocumentCard = (props: { doc: KBDocument }) => <Card p="md" radius="md" component="a" href="#"
                                                                  className={""}>
    <AspectRatio ratio={1920 / 1080}>
        <BackgroundImage
            src="https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=720&q=80"
            radius="sm"
        ></BackgroundImage>
    </AspectRatio>
    <Text color="dimmed" size="xs" transform="uppercase" weight={700} mt="md">
        27 July, 2023
    </Text>
    <Text className={""} mt={5}>
        {props.doc.title}
    </Text>
</Card>;
