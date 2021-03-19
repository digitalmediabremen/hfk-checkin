import React from "react";
import { ArrowLeft } from "react-feather";
import useTheme from "../../src/hooks/useTheme";
import Bar from "./Bar";

interface SubPageBarProps {
    title: string;
    onBack?: (subPage?: string) => void;
}

const SubPageBar: React.FunctionComponent<SubPageBarProps> = ({
    title,
    onBack,
}) => {
    const theme = useTheme();

    return (
        <>
            <style jsx>{`
                .header {
                    display: flex;
                    // line-height: 0;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    width: 100%;
                    z-index: 2000;
                }
                .title {
                    display: inline-block;
                    font-size: 1.25rem;
                    font-weight: bold;
                    color: ${theme.primaryColor};
                    max-width: 100%;
                }

                .back {
                    line-height: 0;
                    position: absolute;
                    left: 0px;
                    color: ${theme.primaryColor};
                }
            `}</style>
            <Bar extendedWidth>
                <div className="header" onClick={() => onBack?.()}>
                    {!!onBack && (
                        <span className="back">
                            <ArrowLeft strokeWidth={2} />
                        </span>
                    )}
                    <h1 className="title">{title}</h1>
                </div>
            </Bar>
        </>
    );
};

export default SubPageBar;
