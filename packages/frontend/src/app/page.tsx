'use client';
import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {Auth} from "@aws-amplify/auth";

export default function Home() {
    const router = useRouter();
    useEffect(() => {
        Auth.currentAuthenticatedUser().then((user) => {
            if (user) {
                router.push('/docs/list');
            } else {
                router.push('/auth/login');
            }
        }).catch((e) => {
            if (e.toString().includes('The user is not authenticated')) {
                router.push('/auth/login');
                return;
            }

            // otherwise, re-throw the error
            throw e;
        })
    }, [router])
    return <></>
}
