import Link from "next/link";
import React, { SFC } from "react";
import { appUrls } from "../../config";
import theme from "../../styles/theme";
import { useAppState } from "./AppStateProvider";
import StatusBar from "./StatusBar";

const AppWrapper: SFC = (props) => {
    const { children } = props;
    const { appState } = useAppState();
    const { profile } = appState;

    return (
        <>
            <style jsx>
                {`
                    .content {
                        margin: ${theme.spacing(3)}px;
                    }
                    .wrapper {
                        min-height: 100vh;
                        padding-bottom: 30px;
                        // min-height: calc(100vh - 60px);
                    }
                    .footer {
                        margin-top: -60px;
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
