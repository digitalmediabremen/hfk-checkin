import classNames from "classnames";
import * as React from "react";
import { ArrowLeft } from "react-feather";
import theme from "../../styles/theme";
import EllipseText from "./EllipseText";
import { Content, Page } from "./Page";
import Subtitle from "./Subtitle";
import Title from "./Title";

const SubPageHeader = ({ title, onBack }: { title: string, onBack: () => void}) => (
    <>
        <style jsx>{`
            .header {
                height: ${theme.topBarHeight + 1}px;
                background: white;
                border-bottom: 1px solid ${theme.primaryColor};
                display: flex;
                line-height: 0;
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
                display: inline-block;
                font-size: 20px;
                font-weight: bold;
                color: ${theme.primaryColor};
                max-width: 100%;
            }

            .back {
                line-height: 0;
                position: absolute;
                left: ${theme.spacing(2)}px;
                color: ${theme.primaryColor};
                transform: translateY(1px);
            }
        `}</style>
        <div className="header" onClick={onBack}>
            <span className="back">
                <ArrowLeft strokeWidth={1} />
            </span>

            <h1 className="title">
                {title}
            </h1>
        </div>
    </>
);

export interface SubPageProps {
    title: string;
    onBack: () => void;
    children: () => React.ReactNode;
}

const SubPage: React.FunctionComponent<SubPageProps> = (props) => {
    const { children, title, onBack } = props;
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
            <div className="sub-wrapper">
                <Page
                    scroll
                    topBar={<SubPageHeader onBack={onBack} title={title} />}
                >
                    {children()}
                </Page>
            </div>
        </>
    );
};

export default SubPage;
