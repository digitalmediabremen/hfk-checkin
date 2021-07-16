import React from "react";
import useInitApp from "../../src/hooks/useInitApp";
import useTheme from "../../src/hooks/useTheme";

interface AppWrapperProps {}

const AppWrapper: React.FunctionComponent<AppWrapperProps> = ({ children }) => {
    useInitApp();
    const theme = useTheme();

    return (
        <>
            <style jsx>{`
                :global(html, body) {
                    background-color: ${theme.secondaryColor};
                }
            `}</style>
            {children}
        </>
    );
};

export default AppWrapper;
