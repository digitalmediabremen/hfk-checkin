import { NextPage, NextPageContext } from "next";
import { useRouter } from "next/router";
import * as config from "../config";
import { useState } from "react";
import Subtitle from "../components/common/Subtitle";
import { Button } from "../components/common/Button";
import FormGroup from "../components/common/FormGroup";
import Text from "../components/common/Text";
import { useTranslation } from "../localization";
import Notice from "../components/common/Notice";

const NewProfilePage: NextPage = () => {
    const router = useRouter();
    const handleIntern = () => {
        const url = config.appUrls.redirect;
        router.replace(url);
    };
    const handleGuest = () => {
        router.push(config.appUrls.setprofile);
    };

    const { t, locale } = useTranslation("createProfile");

    return (
        <>
            <FormGroup>
                <Text paragraph>
                    {t(
                        `Präsenzlehre und ein flexibleres Zugangsverfahren zu den Räumen der HfK sind nur möglich, wenn alle HfK-Mitglieder die Corona-Maßnahmen unterstützen.`,
                        {},
                        "follow-the-rules-1"
                    )}
                </Text>
                <Text paragraph>
                    {t(
                        `Bitte dokumentiere deinen Aufenthalt in den Gebäuden und Räumen der HfK in eigenverantwortlich und halte dich an die HfK-Hygieneregeln.`,
                        {},
                        "follow-the-rules-2"
                    )}
                </Text>
            </FormGroup>
            <FormGroup>
                <Subtitle>{t("Hfk-Angehörige")}</Subtitle>
                <Button outline onClick={handleIntern}>
                    HfK-Login
                </Button>
            </FormGroup>
            <Subtitle>{t("Gäste")}</Subtitle>
            <Notice>Verifikation mit Identitätsnachweis nach der Registrierung notwendig.</Notice>
            <Button outline onClick={handleGuest}>
                {t("Gastzugang")}
            </Button>
        </>
    );
};

export default NewProfilePage;
