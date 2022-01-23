import classNames from "classnames";
import * as React from "react";
import { AlertCircle } from "react-feather";
import useTheme from "../../src/hooks/useTheme";
import FormText from "./FormText";
interface NoticeProps {
    error?: true;
    warning?: true;
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
                .notice-wrapper {
                    display: flex;
                    color: ${error ? theme.primaryColor : theme.disabledColor};
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
            <div className={classNames("notice-wrapper", { error })}>
                {error && (
                    <span className="icon">
                        <AlertCircle />
                    </span>
                )}
                <div className="content">
                    {title && <h3>{title}</h3>}
                    <FormText bottomSpacing={0} secondary={!error}>
                        {children}
                    </FormText>
                </div>
            </div>
        </>
    );
};

export default Notice;
