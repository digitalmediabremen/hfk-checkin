import classNames from "classnames";
import React, { ReactNode } from "react";
import { use100vh } from "react-div-100vh";
import useTheme from "../../src/hooks/useTheme";
export const Content: React.FunctionComponent = ({ children }) => {
    const theme = useTheme();
    return (
        <>
            <style jsx>
                {`
                    .content {
                        margin: ${theme.spacing(2)}px ${theme.spacing(3)}px;
                        max-width: ${theme.desktopWidth}px;
                    }

                    @media screen and (min-width: ${theme.desktopWidth +
                        theme.spacing(6)}px) {
                        .content {
                            margin: ${theme.spacing(2)}px auto;
                        }
                    }
                `}
            </style>
            <div className="content">{children}</div>
        </>
    );
};

interface PageProps {
    topBar?: ReactNode;
    footer?: ReactNode;
    scroll?: boolean;
    noContentMargin?: boolean;
    active?: boolean;
}

const Page: React.FunctionComponent<PageProps> = ({
    children,
    topBar,
    footer,
    scroll,
    noContentMargin,
    active,
}) => {
    const theme = useTheme();
    const height = use100vh();
    if (!active) return null;
    return (
        <>
            <style jsx>{`
                .page {
                    min-height: ${height! -
                    theme.topBarHeight() -
                    theme.spacing(2)}px;
                    position: relative;
                    // height: 100%;
                    margin: 0 auto;
                    display: block;
                    // fix adjecant margin top error
                    border-top: 1px solid transparent;
                }
                .page-wrapper {
                    position: absolute;
                    width: 100vw;
                    height: ${height}px;
                    overflow: hidden;
                    background-color: ${theme.secondaryColor};
                    transition: background-color 0.15s;
                }

                .scroll-container {
                    overflow-y: auto;
                    overflow-x: hidden;
                    // bouncy scroll behaviour
                    -webkit-overflow-scrolling: touch;
                    height: ${height! - theme.topBarHeight()}px;
                }

                .scroll-container::-webkit-scrollbar {
                    display: none;
                }

                .page.with-topbar {
                    // padding-top: ${theme.topBarHeight()}px;
                }
                .page.with-footer {
                    padding-bottom: ${theme.footerHeight()}px;
                }
            `}</style>
            <div className={classNames({ "page-wrapper": scroll })}>
                {topBar}
                <div className={classNames({ "scroll-container": scroll })}>
                    <div
                        className={classNames("page", {
                            "with-topbar": !!topBar,
                            "with-footer": !!footer,
                        })}
                    >
                        {noContentMargin ? (
                            <>{children} </>
                        ) : (
                            <Content>{children}</Content>
                        )}
                    </div>
                    {footer}
                </div>
            </div>
        </>
    );
};

export default Page;
