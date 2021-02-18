import React, { useState } from "react";
import { useTranslation } from "../../../localization";
import FormTextInput from "../../common/FormTextInput";
import { Input } from "../../common/Input";
import Notice from "../../common/Notice";
import PhoneInput from "../../common/PhoneInput";

interface AddExternalPersonSubPageProps {}

const AddExternalPersonSubPage: React.FunctionComponent<AddExternalPersonSubPageProps> = ({}) => {
    const { t } = useTranslation();
    const [name, setName] = useState("");
    return (
        <>
            <style jsx>{``}</style>
            <FormTextInput
                label={t("Vorname")}
                value={name}
                onChange={setName}
            ></FormTextInput>
            <FormTextInput
                label={t("Nachname")}
                value={name}
                onChange={setName}
                bottomSpacing={3}
            ></FormTextInput>

            <FormTextInput
                label={t("Telefon")}
                value={name}
                onChange={setName}
            ></FormTextInput>
            <FormTextInput
                label={t("E-Mail")}
                value={name}
                onChange={setName}
                bottomSpacing={2}
            ></FormTextInput>
            {/* <PhoneInput value="22" /> */}
            <Notice>
                {t(
                    "Die E-Mail Adresse und die Telefonnummer werden nur verwendet um den Gast bei Rückfragen kontaktieren zu können."
                )}
            </Notice>
        </>
    );
};

export default AddExternalPersonSubPage;
