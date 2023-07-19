'use client';
import {useEffect} from "react";
import Auth from "@aws-amplify/auth";
import {useRouter} from "next/navigation";

export default function Home() {
    const router = useRouter();
    useEffect(() => {
        Auth.currentAuthenticatedUser().then((user) => {
            if (user) {
                router.push('/docs/list');
            } else {
                router.push('/auth/signin');
            }
        })
    }, [router])
    return <></>
}
