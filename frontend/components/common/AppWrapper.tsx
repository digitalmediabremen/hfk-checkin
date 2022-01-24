import React, { useEffect, useState } from "react";
import useInitApp from "../../src/hooks/useInitApp";
import useTheme from "../../src/hooks/useTheme";

interface AppWrapperProps {}

const AppWrapper: React.FunctionComponent<AppWrapperProps> = ({ children }) => {
    const initialized = useInitApp();
    const theme = useTheme();

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
