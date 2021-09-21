import * as React from "react";
import Page from "./Page";
import SubPageBar from "./SubPageBar";
import TopBar from "./TopBar";

export interface SubPageProps {
    title: React.ReactNode;
    onBack: (subPage?: string) => void;
    children: (() => React.ReactNode) | React.ReactNode;
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
                topBar={
                    <TopBar>
                        <SubPageBar onBack={onBack} title={title} />
                    </TopBar>
                }
            >
                {children instanceof Function ? children() : children}
            </Page>
        </>
    );
};

export default SubPage;
