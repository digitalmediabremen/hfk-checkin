import classNames from "classnames";
import React, { ReactNode } from "react";
import features from "../../features";
import { useTranslation } from "../../localization";
import theme from "../../styles/theme";
import { useUpdateProfileFromAppStateAndUpdate } from "../api/ApiHooks";
import EnterCodeButton from "./EnterCodeButton";
import Footer from "./Footer";
import StatusBar from "./StatusBar";

interface LayoutProps {
    hasActiveSubpage?: boolean;
}

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

export const Page: React.FunctionComponent<PageProps> = ({
    children,
    topBar,
    footer,
    scroll
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

const Layout: React.FunctionComponent<LayoutProps> = ({
    children,
    hasActiveSubpage,
}) => {
    const subpageable = hasActiveSubpage !== undefined;
    return (
        <>
            <style jsx>
                {`
                    .wrapper.subpageable {
                        position: absolute;
                        top: 0;
                        left: 0;
                        transform: translateX(0vw);
                        transition: transform 0.2s;
                        width: 100vw;
                    }

                    .wrapper.hasActiveSubpage {
                        transform: translateX(-100vw);
                    }

                    .clip {
                        overflow: hidden;
                        width: 100vw;
                    }
                `}
            </style>
            <div className="clip">
                <div
                    className={classNames("wrapper", {
                        hasActiveSubpage,
                        subpageable,
                    })}
                >
                    <Page
                        scroll={subpageable}
                        topBar={
                            <StatusBar
                                action={() => {
                                    if (!features.checkin) return undefined;
                                    return <EnterCodeButton />;
                                }}
                            />
                        }
                        footer={<Footer />}
                    >
                        {children}
                    </Page>
                </div>
            </div>
        </>
    );
};

export default Layout;
