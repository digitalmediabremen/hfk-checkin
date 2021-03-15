import * as React from "react";
import { ArrowLeft } from "react-feather";
import useTheme from "../../src/hooks/useTheme";import Page from "./Page";
import TopBar from "./TopBar";

export const SubPageHeader = ({
    title,
    onBack,
}: {
    title: string;
    onBack: (subPage?: string) => void;
}) => {
    const theme = useTheme();

    return (
    <>
        <style jsx>{`
            .header {
                display: flex;
                // line-height: 0;
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
                left: 0px;
                color: ${theme.primaryColor};
            }
        `}</style>
        <div className="header" onClick={() => onBack()}>
            <span className="back">
                <ArrowLeft strokeWidth={2} />
            </span>
            <h1 className="title">{title}</h1>
        </div>
    </>
)};

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
