import * as React from "react";
import { useTranslation } from "../localization";
import Title from "../components/common/Title";
import Text from "../components/common/Text";
import { Button } from "../components/common/Button";
import FormGroup from "../components/common/FormGroup";
import PushToBottom from "../components/PushToBottom";
import { useRouter } from "next/router";
import { appUrls } from "../config";

interface VerifyProfilePageProps {}

const VerifyProfilePage: React.FunctionComponent<VerifyProfilePageProps> = (
    props
) => {
    const { t } = useTranslation();
    const router = useRouter();
    return (
        <>
            <Title>{t("Dein Profil ist noch nicht verifiziert.")}</Title>
            <FormGroup>
            <Text paragraph>
                {t("Gehe jetzt zur Pforte und lass dein Profil verifieren.")}
            </Text>
            </FormGroup>
            <PushToBottom>
                <Button outline onClick={() => router.push(appUrls.enterCode)}>OK</Button>
            </PushToBottom>
        </>
    );
};

export default VerifyProfilePage;
