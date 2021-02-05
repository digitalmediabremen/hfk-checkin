import Link from "next/link";
import React, { SFC } from "react";
import { appUrls } from "../../config";
import { useTranslation } from "../../localization";
import Profile from "../../model/Profile";
import theme from "../../styles/theme";
import StatusBar from "./StatusBar";
import { useUpdateProfileFromAppStateAndUpdate } from "../api/ApiHooks";
import EnterCodeButton from "./EnterCodeButton";
import features from "../../features";

interface AppWrapperProps {
    profileFromServer?: Profile;
}

const AppWrapper: SFC<AppWrapperProps> = ({ profileFromServer, children }) => {
    const { t } = useTranslation();
    useUpdateProfileFromAppStateAndUpdate();
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

                    .footer a {
                        margin-right: ${theme.spacing(4)}px;
                    }

                    .footer a:hover {
                        cursor: pointer;
                    }
                `}
            </style>
            <div className="wrapper">
                <StatusBar action={
                    () => {
                        if (!features.checkin) return undefined;
                        return <EnterCodeButton />
                    }
                }/>
                <div className="content">{children}</div>
            </div>
            <div className="footer">
                <Link href={appUrls.privacy}>
                    <a>{t("Datenschutzinformationen")}</a>
                </Link>
                <Link href={appUrls.help}>
                    <a>{t("Hilfe")}</a>
                </Link>
            </div>
        </>
    );
};

export default AppWrapper;
