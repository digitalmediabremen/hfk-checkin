import Head from "next/head";
import Link from "next/link";
import React, { SFC, useEffect } from "react";
import { appUrls } from "../../config";
import { useTranslation } from "../../localization";
import Profile from "../../model/Profile";
import theme from "../../styles/theme";
import { useProfile } from "../api/ApiHooks";
import { useAppState } from "./AppStateProvider";
import StatusBar from "./StatusBar";

interface AppWrapperProps {
    profileFromServer?: Profile;
}

const AppWrapper: SFC<AppWrapperProps> = ({ profileFromServer, children }) => {
    const { appState, dispatch } = useAppState();
    // const { profile } = appState;
    const { profile, getProfile, error } = useProfile();
    const { t, locale } = useTranslation();

    useEffect(() => {
        // either profile sent from server
        // or profile loaded via api
        // or error no profile exists
        if (profileFromServer || profile || error) {
            dispatch({
                type: "profile",
                profile: profileFromServer || profile || undefined,
            });
        }
    }, [profile, error]);

    useEffect(() => {
        if (!profileFromServer) {
            getProfile();
        }
    }, []);

    return (
        <>
            <style jsx>
                {`
                    .content {
                        margin: ${theme.spacing(2)}px ${theme.spacing(3)}px;
                    }
                    .wrapper {
                        min-height: 100vh;
                        padding-bottom: ${theme.footerHeight}px;
                        // min-height: calc(100vh - ${theme.footerHeight}px);
                    }
                    .footer {
                        margin-top: ${-theme.footerHeight}px;
                        height: ${theme.footerHeight}px;
                        display: flexbox;
                        align-items: center;
                        padding: 0 ${theme.spacing(3)}px;
                        color: ${theme.primaryColor};
                    }

                    .footer span {
                        padding-right: ${theme.spacing(4)}px;
                    }
                `}
            </style>
            <Head>
                <html lang={locale} />
            </Head>
            <div className="wrapper">
                <StatusBar />
                {appState.initialized && (
                    <div className="content">{children}</div>
                )}
                {!appState.initialized && "..."}
            </div>
            <div className="footer">
                <Link href={appUrls.privacy}>
                    <span>{t("Datenschutz")}</span>
                </Link>
                <Link href={appUrls.help}>
                    <span>{t("Hilfe")}</span>
                </Link>
            </div>
        </>
    );
};

export default AppWrapper;
