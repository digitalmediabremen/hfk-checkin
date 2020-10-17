import Link from "next/link";
import React, { SFC, useEffect } from "react";
import { appUrls } from "../../config";
import theme from "../../styles/theme";
import { useAppState } from "./AppStateProvider";
import StatusBar from "./StatusBar";
import { useProfile } from "../api/ApiHooks";
import Profile from "../../model/Profile";

interface AppWrapperProps {
    profileFromServer?: Profile;
}

const AppWrapper: SFC<AppWrapperProps> = ({profileFromServer, children}) => {
    const { appState, dispatch } = useAppState();
    // const { profile } = appState;
    const { profile, getProfile, error } = useProfile();

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
            console.debug("update profile")
        }
    }, []);

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
                <StatusBar />
                {appState.initialized && <div className="content">{children}</div>}
                {!appState.initialized && "..."}
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
