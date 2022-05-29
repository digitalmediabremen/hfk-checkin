import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { appDisabled } from "../../config";
import useInitApp from "../../src/hooks/useInitApp";
import useTheme from "../../src/hooks/useTheme";

interface AppWrapperProps {}

const AppWrapper: React.FunctionComponent<AppWrapperProps> = ({ children }) => {
    const initialized = useInitApp();
    const theme = useTheme();
    const router = useRouter();
    const ignoreRoutes = ["/disabled", "/privacy", "/set-profile"];
    useEffect(() => {
        if (!appDisabled) return;
        if (ignoreRoutes.includes(router.pathname)) return;
        router.replace("/disabled");
    });
    return (
        <>
            <style jsx>{`
                :global(html, body) {
                    background-color: ${theme.secondaryColor};
                    visibility: ${initialized ? "visible" : "hidden"};
                }
            `}</style>
            {children}
        </>
    );
};

export default AppWrapper;
