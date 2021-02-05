import classNames from "classnames";
import * as React from "react";
import features from "../../features";
import { useTranslation } from "../../localization";
import theme from "../../styles/theme";
import { useUpdateProfileFromAppStateAndUpdate } from "../api/ApiHooks";
import EnterCodeButton from "./EnterCodeButton";
import Footer from "./Footer";
import StatusBar from "./StatusBar";

interface IPageProps {
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

const Page: React.FunctionComponent<IPageProps> = ({
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

                    .page {
                        padding-bottom: ${theme.footerHeight}px;
                        padding-top: ${theme.topBarHeight}px;
                        min-height: 100vh;
                        max-width: 500px;
                        margin: 0 auto;
                        // min-height: calc(100vh - ${theme.footerHeight}px);
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
                    <main className="page">
                        <StatusBar
                            action={() => {
                                if (!features.checkin) return undefined;
                                return <EnterCodeButton />;
                            }}
                        />
                        <Content>{children}</Content>
                    </main>
                    <Footer />
                </div>
            </div>
        </>
    );
};

export default Page;
