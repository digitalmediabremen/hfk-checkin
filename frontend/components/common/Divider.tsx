import React from "react";
import useTheme from "../../src/hooks/useTheme";
interface DividerProps {
    noSpacing?: true;
}

const Divider: React.FunctionComponent<DividerProps> = ({ noSpacing }) => {
    const theme = useTheme();
    return (
        <>
            <style jsx>{`
                hr {
                    border-top: 1px solid ${theme.primaryColor};
                    border-bottom: 0;
                    margin: ${theme.spacing(noSpacing ? 0 : 2)}px
                        ${theme.spacing(noSpacing ? 0 : -3)}px;
                }

                @media screen and (min-width: ${theme.desktopWidth}px) {
                    hr {
                        margin: ${theme.spacing(noSpacing ? 0 : 2)}px
                        calc((100vw - ${theme.desktopWidth}px) / -2);
                    }
                }
            `}</style>
            <hr />
        </>
    );
};

export default Divider;
