import classNames from "classnames";
import React, { Fragment, FunctionComponent } from "react";
import { CSSTransition } from "react-transition-group";
import features from "../../features";
import EnterCodeButton from "./EnterCodeButton";
import Footer from "./Footer";
import Page from "./Page";
import StatusBar from "./StatusBar";

interface PageAnimationProps {
    show?: boolean;
    onExited?: () => void;
}

const PageAnimation: FunctionComponent<PageAnimationProps> = ({
    onExited,
    show,
    children,
}) => {
    if (show === undefined) return <>{children}</>;
    return (
        <>
            <style jsx>
                {`
                    .page-animation {
                        will-change: transform;
                        transform: translateX(0vw);
                        transition: transform 0.2s;
                        width: 100vw;
                    }

                    .page-animation.enter-active,
                    .page-animation.enter-done {
                        transform: translateX(-100vw);
                    }
                    .page-animation.exit-active,
                    .page-animation.exit-done {
                        transform: translateX(0vw);
                    }

                    // disable transition effect when animation not running
                    // to avoid animating window size changes.
                    .page-animation.enter-done,
                    .page-animation.exit-done {
                        transition: none;
                    }

                    // safari fix
                    :global(html), :global(body) {
                        height: 100vh;
                        overflow: hidden;
                    }
                `}
            </style>
                <CSSTransition
                    timeout={200}
                    key={0}
                    in={show}
                    onExited={onExited}
                >
                    <div className="page-animation">{children}</div>
                </CSSTransition>
        </>
    );
};

interface LayoutProps {
    showSubPage?: boolean | undefined;
    onSubPageHide?: () => void;
}

const Layout: FunctionComponent<LayoutProps> = ({
    children,
    showSubPage,
    onSubPageHide,
}) => {
    const hasPageAnimation = showSubPage !== undefined;
    return (
        <PageAnimation show={showSubPage} onExited={onSubPageHide}>
            <Page
                scroll={hasPageAnimation}
                topBar={
                    <StatusBar
                        action={() => {
                            if (!features.checkin) return undefined;
                            return <EnterCodeButton />;
                        }}
                    />
                }
                footer={<Footer />}
            >
                {children}
            </Page>
        </PageAnimation>
    );
};

export default Layout;
