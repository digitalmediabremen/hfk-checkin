import { useRef } from "react";
import { useTranslation } from "../../localization";


export default function () {
    const {locale} = useTranslation();
    const disable = locale !== "de";

    const gender = useRef(
        Math.random() > 0.5
    );

    return (female: string, male?: string) => gender || disable ? female : male;
}