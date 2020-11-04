import { useRouter, NextRouter } from "next/router";

export default function useParam(name:string): [string | undefined, NextRouter] {
    const router = useRouter();
    const paramPossiblyArray = router.query[name];
    if (!paramPossiblyArray) return [undefined, router];
    return [Array.isArray(paramPossiblyArray)
        ? paramPossiblyArray[0]
        : paramPossiblyArray, router]
};