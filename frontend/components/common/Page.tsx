import classNames from "classnames";
import React, { ReactNode } from "react";
import { CSSTransition } from "react-transition-group";
import features from "../../features";
import { useTranslation } from "../../localization";
import theme from "../../styles/theme";
import { useUpdateProfileFromAppStateAndUpdate } from "../api/ApiHooks";
import EnterCodeButton from "./EnterCodeButton";
import Footer from "./Footer";
import StatusBar from "./StatusBar";

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

interface LayoutProps {
    showSubPage?: boolean;
    onSubpageDeactivated?: () => void;
}

import css from "styled-jsx/css";

const Layout: React.FunctionComponent<LayoutProps> = ({
    children,
    showSubPage,
    onSubpageDeactivated,
}) => {
    const subpageable = showSubPage !== undefined;
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

                    .wrapper.enter-active,
                    .wrapper.enter-done {
                        transform: translateX(-100vw);
                    }
                    .wrapper.exit-active, .wrapper-exit-done {
                        transform: translateX(0vw);
                    }

                    // disable transition effect when animation not running
                    // to avoid animating window size changes.
                    .wrapper.enter-done,  .wrapper-exit-done {
                        transition: none;
                    }

                    .clip {
                        overflow: hidden;
                        width: 100vw;
                    }
                `}
            </style>

            <div className="clip">
                <CSSTransition
                    timeout={200}
                    key={0}
                    in={showSubPage}
                    onExited={onSubpageDeactivated}
                    
                >
                    <div
                        className={classNames("wrapper", {
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
                </CSSTransition>
            </div>
        </>
    );
};

export default Layout;
