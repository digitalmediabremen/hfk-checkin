import { NextPage, NextPageContext } from "next";
import { useRouter } from "next/router";
import * as config from "../config";
import { useState, useEffect } from "react";
import Subtitle from "../components/common/Subtitle";
import { Button } from "../components/common/Button";
import FormGroup from "../components/common/FormGroup";
import Text from "../components/common/Text";
import { useTranslation } from "../localization";
import Notice from "../components/common/Notice";
import { useAppState } from "../components/common/AppStateProvider";

const NewProfilePage: NextPage = () => {
    const router = useRouter();
    const handleIntern = () => {
        const url = config.appUrls.loginMicrosoft;
        router.replace(url);
    };
    const handleGuest = () => {
        router.push(config.appUrls.setprofile);
    };

    const { appState } = useAppState();

    useEffect(() => { if (appState.profile) router.replace(config.appUrls.enterCode) }, [appState.profile]);

    const { t, locale } = useTranslation("createProfile");

    if (appState.profile) return null

    return (
        <>
            <FormGroup>
                <Text paragraph>
                    {t(
                        `Präsenzlehre und ein flexibleres Zugangsverfahren zu den Räumen der HfK sind nur möglich, wenn alle HfK-Mitglieder die Corona-Maßnahmen unterstützen`,
                        {},
                        "Halte dich an die Regeln..."
                    )}.
                </Text>
                <Text paragraph>
                    {t(
                        `Bitte dokumentiere deinen Aufenthalt in den Gebäuden und Räumen der HfK in eigenverantwortlich und halte dich an die HfK-Hygieneregeln`,
                        {},
                        "Dokumentiere deinen Aufenthalt..."
                    )}.
                </Text>
            </FormGroup>
            <FormGroup>
                <Subtitle>{t("HfK-Angehörige")}</Subtitle>
                <Button outline onClick={handleIntern}>
                    HfK-Login
                </Button>
            </FormGroup>
            <Subtitle>{t("Gäste")}</Subtitle>
            <Notice>{t("Die Verifizierung mit Identitätsnachweis ist nach der Registrierung notwendig")}.</Notice>
            <Button outline onClick={handleGuest}>
                {t("Gastzugang")}
            </Button>
        </>
    );
};

export default NewProfilePage;
