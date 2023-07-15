'use client';

import {useEffect} from "react";
import {useUser} from "@/hooks/useUser";

const DiaryList = () => {
    const {user, idToken} = useUser()

    useEffect(() => {
        console.log('access token', idToken)
    }, [idToken])

    return "My documents list"
}
export default DiaryList
