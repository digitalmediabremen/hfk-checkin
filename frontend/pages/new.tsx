import { NextPage, NextPageContext } from "next";
import { useRouter } from "next/router";
import * as config from "../config";
import React, { useState, useEffect } from "react";
import Subtitle from "../components/common/Subtitle";
import { Button } from "../components/common/Button";
import FormGroup from "../components/common/FormGroup";
import FormText from "../components/common/FormText";
import { useTranslation } from "../localization";
import Notice from "../components/common/Notice";
import { useAppState } from "../components/common/AppStateProvider";
import Layout from "../components/common/Layout";
import NewButton from "../components/common/NewButton";
import featureMap from "../features";
import Title from "../components/common/Title";

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

    useEffect(() => {
        if (appState.myProfile) router.replace(config.appUrls.home);
    }, [appState.myProfile]);

    const { t } = useTranslation("createProfile");

    if (appState.myProfile || !appState.initialized) return null;

    return (
        <Layout title={t("Anmelden")}>
            <Title>{t("Anmelden")}</Title>
            <FormGroup>
                <FormText paragraph>
                    {t(
                        "Die konsequente Einhaltung des HfK-Hygienekonzepts ist die Voraussetzung für künftige Öffnungsschritte der HfK."
                    )}
                </FormText>
                {featureMap.checkin && (
                    <FormText paragraph>
                        {t(
                            "Bitte verwende Checkin zur Selbst-Dokumentation, denn nur die digitale  Dokumentation ermöglicht, dass die Corona-Beauftragte dich schnell informieren kann, wenn in deinem Umfeld  ein konkretes Infektionsrisiko besteht.",
                            {},
                            "please-use-checkin"
                        )}
                    </FormText>
                )}
                {featureMap.getin && (
                    <>
                        <FormText paragraph>
                            {t(
                                "Aktuell ist die Nutzung von Getin nur mit einem HfK-Account möglich."
                            )}
                        </FormText>
                        <Notice
                            bottomSpacing={4}
                            error
                            title={t("Buchungen können erst mit einem Startzeitpunkt beginnend ab dem 06.04.2021 - 08:00 getätigt werden.")}
                        />
                    </>
                )}
            </FormGroup>
            {featureMap.checkin && <Subtitle>{t("HfK-Angehörige")}</Subtitle>}
            <NewButton onClick={handleIntern} bottomSpacing={3}>
                HfK-Login
            </NewButton>
            {featureMap.checkin && (
                <>
                    <Subtitle>{t("Gäste")}</Subtitle>
                    <Notice>
                        {t(
                            "Die Verifizierung mit Identitätsnachweis ist nach der Registrierung notwendig."
                        )}
                    </Notice>
                    <NewButton onClick={handleGuest}>
                        {t("Gastzugang")}
                    </NewButton>
                </>
            )}
        </Layout>
    );
};

export default NewProfilePage;
