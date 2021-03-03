import classNames from "classnames";
import React, { ReactNode } from "react";
import { use100vh } from "react-div-100vh";
import theme from "../../styles/theme";

export const Content: React.FunctionComponent = ({ children }) => (
    <>
        <style jsx>
            {`
                .content {
                    margin: ${theme.spacing(2)}px ${theme.spacing(3)}px;
                    max-width: 500px;
                }

                @media screen and (min-width: 500px) {
                    .content {
                        margin: ${theme.spacing(2)}px auto;
                    }
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
    noContentMargin?: boolean;
    active?: boolean;
}

const Page: React.FunctionComponent<PageProps> = ({
    children,
    topBar,
    footer,
    scroll,
    noContentMargin,
    active
}) => {
    const height = use100vh();
    return (
        <>
            <style jsx>{`
                .page {
                    min-height: ${height! - theme.topBarHeight}px;
                    position: relative;
                    // height: 100%;
                    margin: 0 auto;
                    display: block;
                    overflow: visible;
                    // fix adjecant margin top error
                    border-top: 1px solid transparent;
                }
                .page-wrapper {
                    position: absolute;
                    width: 100vw;
                    height: ${height}px;
                    background-color: #fff;
                    overflow: hidden;
                }

                .scroll-container {
                    overflow-y: auto;
                    overflow-x: hidden;
                    height: ${height! - theme.topBarHeight}px;
                }

                .page.with-topbar {
                    // padding-top: ${theme.topBarHeight}px;
                }
                .page.with-footer {
                    padding-bottom: ${theme.footerHeight}px;
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
