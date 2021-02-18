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
    const height = use100vh();
    return (
        <>
            <style jsx>{`
                .page {
                    height: ${height}px;
                    max-width: 500px;
                    margin: 0 auto;
                    overflow-y: auto;
                    overflow-x: hidden;
                }
                .page-wrapper {
                    position: absolute;
                    width: 100vw;
                    height: ${height}px;
                    overflow: hidden;
                    background-color: #fff;
                }
                .page.with-topbar {
                    padding-top: ${theme.topBarHeight}px;
                }
                .page.with-footer {
                    padding-bottom: ${theme.footerHeight}px;
                }
            `}</style>
            <div className={classNames({ "page-wrapper": scroll })}>
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