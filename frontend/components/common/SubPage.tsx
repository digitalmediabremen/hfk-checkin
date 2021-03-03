import * as React from "react";
import { ArrowLeft } from "react-feather";
import theme from "../../styles/theme";
import Page from "./Page";
import TopBar from "./TopBar";

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
                display: flex;
                line-height: 0;
                align-items: center;
                justify-content: center;
                position: relative;
                width: 100%;
                z-index: 2000;
            }
            .title {
                display: inline-block;
                font-size: 1.25rem;
                font-weight: bold;
                color: ${theme.primaryColor};
                max-width: 100%;
            }

            .back {
                line-height: 0;
                position: absolute;
                left: ${theme.spacing(0)}px;
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
    noContentMargin?: boolean;
}

const SubPage: React.FunctionComponent<SubPageProps> = (props) => {
    const { children, title, onBack, active, noContentMargin } = props;
    if (!active) return null;
    return (
        <>
            <style jsx>{``}</style>
            <Page
                active={true}
                noContentMargin={noContentMargin}
                scroll
                topBar={<TopBar><SubPageHeader onBack={onBack} title={title} /></TopBar>}
            >
                {children()}
            </Page>
        </>
    );
};

export default SubPage;
