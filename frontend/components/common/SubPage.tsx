import classNames from "classnames";
import * as React from "react";
import theme from "../../styles/theme";
import EllipseText from "./EllipseText";
import { Content, Page } from "./Page";
import Subtitle from "./Subtitle";
import Title from "./Title";

const SubPageHeader = ({ title }: { title: string }) => (
    <>
        <style jsx>{`
            .header {
                height: ${theme.topBarHeight + 1}px;
                background: white;
                border-bottom: 1px solid ${theme.primaryColor};
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0 ${theme.spacing(6)}px;
                box-sizing: border-box;
                z-index: 2001;
                overflow: hidden;
                position: fixed;
                width: 100%;
                top: 0;
                left: 0;
                right: 0;
                z-index: 200;
            }
            .title {
                display: inline;
                font-size: 1.3em;
                font-weight: bold;
                color: ${theme.primaryColor};
            }

            .back {
                font-size: 2em;
                line-height: 0em;
                position: absolute;
                left: ${theme.spacing(2)}px;
                color: ${theme.primaryColor};
            }
        `}</style>
        <div className="header">
            <span className="back">{"<"}</span>
            <EllipseText>
                <h1 className="title">{title}</h1>
            </EllipseText>
        </div>
    </>
);

interface SubPageProps {
    title: string;
    onBack: () => void;
    children: () => React.ReactNode;
    active: boolean;
}

const SubPage: React.FunctionComponent<SubPageProps> = (props) => {
    const { children, title, onBack, active } = props;
    const [intitialRender, activate] = React.useState(active);
    React.useEffect(() => {
        if (active) activate(true);
    }, [active]);
    if (!intitialRender) return null;
    return (
        <>
            <style jsx>{`
                .sub-wrapper {
                    position: absolute;
                    height: 100vh;
                    width: 100vw;
                    top: 0px;
                    left: 0vw;
                    right: 0px;
                    bottom: 0px;
                    overflow: hidden;
                    background-color: ${theme.secondaryColor};
                    z-index: 100;
                    transform: translateX(100vw);
                }
            `}</style>
            <div className="sub-wrapper" onClick={onBack}>
                <Page scroll topBar={<SubPageHeader title={title} />}>
                        {children()}
                </Page>
            </div>
        </>
    );
};

export default SubPage;
