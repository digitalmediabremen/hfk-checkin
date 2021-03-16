import { NextPage, NextPageContext } from "next";
import { useRouter } from "next/router";
import * as config from "../config";
import React, { useState, useEffect } from "react";
import Subtitle from "../components/common/Subtitle";
import { Button } from "../components/common/Button";
import FormGroup from "../components/common/FormGroup";
import Text from "../components/common/Text";
import { useTranslation } from "../localization";
import Notice from "../components/common/Notice";
import { useAppState } from "../components/common/AppStateProvider";
import Layout from "../components/common/Layout";

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

    const { t, locale } = useTranslation("createProfile");

    if (appState.myProfile || !appState.initialized) return null;

    return (
        <Layout>
            <FormGroup>
                <Text paragraph>
                    {t(
                        "Die konsequente Einhaltung des HfK-Hygienekonzepts ist die Voraussetzung für künftige Öffnungsschritte der HfK."
                    )}
                    .
                </Text>
                <Text paragraph>
                    {t(
                        "Bitte verwende Checkin zur Selbst-Dokumentation, denn nur die digitale  Dokumentation ermöglicht, dass die Corona-Beauftragte dich schnell informieren kann, wenn in deinem Umfeld  ein konkretes Infektionsrisiko besteht.",
                        {},
                        "please-use-checkin"
                    )}
                    .
                </Text>
            </FormGroup>
            <FormGroup>
                <Subtitle>{t("HfK-Angehörige")}</Subtitle>
                <Button outline onClick={handleIntern}>
                    HfK-Login
                </Button>
            </FormGroup>
            <Subtitle>{t("Gäste")}</Subtitle>
            <Notice>
                {t(
                    "Die Verifizierung mit Identitätsnachweis ist nach der Registrierung notwendig"
                )}
                .
            </Notice>
            <Button outline onClick={handleGuest}>
                {t("Gastzugang")}
            </Button>
        </Layout>
    );
};

export default NewProfilePage;
