import React, { SFC, useEffect } from "react";
import theme from "../../styles/theme";
import { useAppState } from "./AppStateProvider";
import StatusBar from "./StatusBar";
import { useProfile } from "../api/ApiHooks";
import { appUrls } from "../../config";
import Link from "next/link";

const AppWrapper: SFC = (props) => {
    const { children } = props;
    const { profile, getProfile } = useProfile();
    useEffect(() => getProfile(), []);

    return (
        <>
            <style jsx>
                {`
                    .content {
                        margin: ${theme.spacing(3)}px;
                    }
                    .wrapper {
                        min-height: calc(100vh - 60px);
                    }
                    .footer {
                        height: 60px;
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
            <div className="wrapper">
                <StatusBar profile={profile} />
                <div className="content">{children}</div>
            </div>
            <div className="footer">
                <Link href={appUrls.privacy}>
                    <span>Datenschutz</span>
                </Link>
                <Link href={appUrls.help}>
                    <span>Hilfe</span>
                </Link>
            </div>
        </>
    );
};

export default AppWrapper;
