import React, { SFC, useEffect } from "react";
import theme from "../../styles/theme";
import { useAppState } from "./AppStateProvider";
import StatusBar from "./StatusBar";
import { useProfile } from "../api/ApiHooks";

const AppWrapper: SFC = (props) => {
    const { children } = props;
    const { profile, getProfile } = useProfile();
    useEffect(() => getProfile(), []);

    return (
        <>
            <StatusBar profile={profile} />
            <div>
                <style jsx>
                    {`
                        div {
                            margin: ${theme.spacing(3)}px;
                        }
                    `}
                </style>
                {children}
            </div>
        </>
    );
};

export default AppWrapper;
