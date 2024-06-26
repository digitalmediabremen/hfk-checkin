import React, { ReactNode } from "react";
import { ArrowLeft } from "react-feather";
import useTheme from "../../src/hooks/useTheme";
import Bar from "./Bar";

interface SubPageBarProps {
    title: ReactNode;
    onBack?: (subPage?: string) => void;
    actionIcon?: ReactNode;
}

const SubPageBar: React.FunctionComponent<SubPageBarProps> = ({
    title,
    onBack,
    actionIcon,
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

                .push-right {
                    line-height: 0;
                    position: absolute;
                    right: 0px;
                }
            `}</style>
            <Bar extendedWidth>
                <div className="header">
                    {!!onBack && (
                        <span className="back" onClick={() => onBack?.()}>
                            <ArrowLeft strokeWidth={2} />
                        </span>
                    )}
                    <h1 className="title">{title}</h1>
                    {actionIcon && (
                        <span className="push-right">{actionIcon}</span>
                    )}
                </div>
            </Bar>
        </>
    );
};

export default SubPageBar;
