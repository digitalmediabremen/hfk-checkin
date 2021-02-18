import * as React from "react";
import { ArrowLeft } from "react-feather";
import theme from "../../styles/theme";
import Page from "./Page";

const SubPageHeader = ({
    title,
    onBack,
}: {
    title: string;
    onBack: (subPage?: string) => void;
}) => (
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
                overflow: hidden;
                position: fixed;
                width: 100%;
                top: 0;
                left: 0;
                right: 0;
                z-index: 20;
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
        <div className="header" onClick={() => onBack()}>
            <span className="back">
                <ArrowLeft strokeWidth={1} />
            </span>

            <h1 className="title">{title}</h1>
        </div>
    </>
);

export interface SubPageProps {
    title: string;
    onBack: (subPage?: string) => void;
    children: () => React.ReactNode;
    active: boolean;
}

const SubPage: React.FunctionComponent<SubPageProps> = (props) => {
    const { children, title, onBack, active } = props;
    if (!active) return null;
    return (
        <>
            <style jsx>{``}</style>
            <Page
                scroll
                topBar={<SubPageHeader onBack={onBack} title={title} />}
            >
                {children()}
            </Page>
        </>
    );
};

export default SubPage;
