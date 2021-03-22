import * as React from "react";
import { useTranslation } from "../localization";
import Title from "../components/common/Title";
import Text from "../components/common/Text";
import { Button } from "../components/common/Button";
import FormGroup from "../components/common/FormGroup";
import AlignContent from "../components/common/AlignContent";
import { useRouter } from "next/router";
import { appUrls } from "../config";
import Subtitle from "../components/common/Subtitle";
import Layout from "../components/common/Layout";
import NewButton from "../components/common/NewButton";
import Link from "next/link";

interface VerifyProfilePageProps {}

const VerifyProfilePage: React.FunctionComponent<VerifyProfilePageProps> = (
    props
) => {
    const { t } = useTranslation("verifyProfile");
    const router = useRouter();
    return (
        <Layout title={t("Identitätsprüfung")}>
            <Subtitle>{t("Identitätsprüfung")}</Subtitle>
            <FormGroup>
                <Text paragraph>
                    {t(
                        "Per Verordnung ist die HfK verpflichtet, den Zugang zu den Gebäuden zu kontrollieren, um das Infektionsrisiko zu minimieren."
                    )}
                </Text>
                <Text paragraph>
                    <b>
                        {t(
                            "Bitte zeigen Sie jetzt einen Identitätsnachweis (Lichtbildausweis) am Empfang vor"
                        )}
                        .
                    </b>
                </Text>
                <Text paragraph>
                    {t(
                        "Bevor ihre Identität nicht verifiziert ist, ist die Protokollierung und ein Eintritt nicht möglich."
                    )}
                </Text>
            </FormGroup>
            <br />
            <Link href={appUrls.home} passHref>
                <NewButton componentType="a">
                    {t("Erledigt")}
                </NewButton>
            </Link>
        </Layout>
    );
};

export default VerifyProfilePage;
