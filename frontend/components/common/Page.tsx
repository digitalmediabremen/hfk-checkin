import classNames from "classnames";
import React, { ReactNode } from "react";
import theme from "../../styles/theme";

export const Content: React.FunctionComponent = ({ children }) => (
    <>
        <style jsx>
            {`
                .content {
                    margin: ${theme.spacing(2)}px ${theme.spacing(3)}px;
                }
            `}
        </style>
        <div className="content">{children}</div>
    </>
);

interface PageProps {
    topBar?: ReactNode;
    footer?: ReactNode;
    scroll?: boolean;
}

const Page: React.FunctionComponent<PageProps> = ({
    children,
    topBar,
    footer,
    scroll,
}) => {
    return (
        <>
            <style jsx>{`
                .page {
                    min-height: 100vh;
                    max-width: 500px;
                    margin: 0 auto;
                    // overflow-x: scroll;
                }
                .scroll {
                    height: 100vh;
                    overflow-x: scroll;
                }
                .page.with-topbar {
                    padding-top: ${theme.topBarHeight}px;
                }
                .page.with-footer {
                    padding-bottom: ${theme.footerHeight}px;
                }
            `}</style>
            <div className={classNames({ scroll })}>
                <div
                    className={classNames("page", {
                        "with-topbar": !!topBar,
                        "with-footer": !!footer,
                    })}
                >
                    {topBar}
                    <Content>{children}</Content>
                </div>
                {footer}
            </div>
        </>
    );
};

export default Page;