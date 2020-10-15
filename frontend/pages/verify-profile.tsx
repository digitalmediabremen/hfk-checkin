import * as React from "react";
import { useTranslation } from "../localization";
import Title from "../components/common/Title";
import Text from "../components/common/Text";
import { Button } from "../components/common/Button";
import FormGroup from "../components/common/FormGroup";
import PushToBottom from "../components/common/PushToBottom";
import { useRouter } from "next/router";
import { appUrls } from "../config";
import Subtitle from "../components/common/Subtitle";

interface VerifyProfilePageProps {}

const VerifyProfilePage: React.FunctionComponent<VerifyProfilePageProps> = (
    props
) => {
    const { t } = useTranslation();
    const router = useRouter();
    return (
        <>
            <Subtitle>{t("Identitätsprüfung")}</Subtitle>
            <FormGroup>
            <Text paragraph>
                {t("Die Hochschule für Künste ist verpflichtet die Identität aller Personen festzustellen, um im Falle einer Infektion eine Nachverfolgung gewährleisten zu können.")}
            </Text>
            <Text paragraph>
            <b>Bitte zeigen Sie jetzt einen Identitätsnachweis (Lichtbildausweis) am Empfang vor</b>, um die Registrierung abzuschließen und mit der Protokollierung beginnen zu können.
            </Text>
            <Text paragraph>
            Bevor ihre Identität nicht verifiziert ist, ist die Protokollierung und ein Eintritt nicht möglich.
            </Text>
            </FormGroup>
            <br />
            <Button outline onClick={() => router.push(appUrls.enterCode)}>Erledigt</Button>
        </>
    );
};

export default VerifyProfilePage;
