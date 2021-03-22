import classNames from "classnames";
import * as React from "react";
import { AlertCircle } from "react-feather";
import useTheme from "../../src/hooks/useTheme";
import Text from "./Text";
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
    const theme = useTheme();
    return (
        <>
            <style jsx>{`
                .wrapper {
                    display: flex;
                    color: ${theme.primaryColor};
                    margin-bottom: ${theme.spacing(bottomSpacing || 1)}px;
                }

                h3 {
                    font-size: 1rem;
                    margin: 0;
                    padding: 0;
                    margin-bottom: ${theme.spacing(1)}px;
                }

                .icon {
                    flex: 0 0 ${theme.spacing(5)}px;
                    line-height: 0px;
                }

                .content {
                    width: 100%;
                }

                .error .content {
                    margin-top: ${theme.spacing(0.25)}px;
                    flex: 1;
                    width: calc(100% - ${theme.spacing(5)}px);

                }
            `}</style>
            <div className={classNames("wrapper", { error })}>
                {error && (
                    <span className="icon">
                        <AlertCircle />
                    </span>
                )}
                <div className="content">
                    {title && <h3>{title}</h3>}
                    <Text secondary={!error}>{children}</Text>
                </div>
            </div>
        </>
    );
};

export default Notice;
