import classNames from "classnames";
import * as React from "react";
import { AlertCircle } from "react-feather";
import theme from "../../styles/theme";

interface NoticeProps {
    error?: true;
    title?: string;
    bottomSpacing?: number;
}

const Notice: React.FunctionComponent<NoticeProps> = ({
    children,
    bottomSpacing,
    error,
    title,
}) => {
    return (
        <>
            <style jsx>{`
                .wrapper {
                    display: flex;
                    color: ${theme.primaryColor};
                    margin-bottom: ${theme.spacing(bottomSpacing || 1)}px;
                }

                h3 {
                    font-size: 1em;
                    margin: 0;
                    padding: 0;
                    margin-bottom: ${theme.spacing(1)}px;
                }

                .icon {
                    flex: 0 0 ${theme.spacing(4)}px;
                    line-height: 0px;
                }

                .text{
                    font-style: italic;
                }

                .error .text {
                    margin-top: 0.2em;
                    font-style: normal;
                }
            `}</style>
            <div className={classNames("wrapper", { error })}>
                {error && (
                    <span className="icon">
                        <AlertCircle />
                    </span>
                )}
                <div className="text">
                    {title && <h3>{title}</h3>}
                    {children}
                </div>
            </div>
        </>
    );
};

export default Notice;
