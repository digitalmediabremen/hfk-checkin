import classNames from "classnames";
import React, { FunctionComponent, ReactElement } from "react";
import { use100vh } from "react-div-100vh";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import features from "../../features";
import { TransitionDirection } from "../../src/model/AppState";
import { useAppState } from "./AppStateProvider";
import EnterCodeButton from "./EnterCodeButton";
import Footer from "./Footer";
import Page from "./Page";
import StatusBar from "./StatusBar";

interface PageAnimationProps {
    activeSubPage?: string;
    direction: TransitionDirection;
    show?: boolean;
}

const PageAnimation: FunctionComponent<PageAnimationProps> = ({
    children,
    activeSubPage,
    direction,
    show,
}) => {
    if (!show) return <>{children}</>;
    const height = use100vh();
    return (
        <>
            <style jsx>
                {`
                    .page-animation {
                        z-index: 10;
                        overflow: hidden;
                    }

                    // start

                    .page-animation > :global(.page-wrapper) {
                        transition: transform 1000ms;
                        will-change: transform, z-index;
                    }

                    :global(.left .page-animation > .page-wrapper) {
                        transform: translateX(-100vw);
                    }

                    :global(.right .page-animation > .page-wrapper) {
                        transform: translateX(100vw);
                    }

                    // enter

                    .page-animation.enter-active > :global(.page-wrapper) {
                        transform: translateX(0vw);
                    }
                    .page-animation.enter-done > :global(.page-wrapper) {
                        transform: translateX(0vw);
                        z-index: 10;
                    }

                    // leave

                    :global(.left .page-animation.exit-active > .page-wrapper) {
                        transform: translateX(100vw);
                    }

                    :global(.right
                            .page-animation.exit-active
                            > .page-wrapper) {
                        transform: translateX(-100vw);
                    }

                    .page-animation.exit-done > :global(.page-wrapper) {
                        z-index: 1;
                    }

                    :global(.left .page-animation.exit-done > .page-wrapper) {
                        transform: translateX(100vw);
                    }

                    :global(.left
                            .page-animation.exit-done.right
                            > .page-wrapper) {
                        transform: translateX(-100vw);
                    }

                    // disable transition effect when animation not running
                    // to avoid animating window size changes.
                    .page-animation.enter-done > :global(.page-wrapper),
                    .page-animation.exit-done > :global(.page-wrapper) {
                        transition: none;
                    }

                    // safari fix
                    :global(body) {
                        height: ${height}px;
                        overflow: hidden;
                        position: relative;
                    }
                `}
            </style>
            <TransitionGroup className={direction} component="div" appear>
                <CSSTransition
                    key={activeSubPage || "home"}
                    timeout={1000}
                    mountOnEnter={true}
                    unmountOnExit={true}
                >
                    <div className={classNames("page-animation")}>
                        {children}
                    </div>
                </CSSTransition>
            </TransitionGroup>
        </>
    );
};

export interface LayoutProps {
    activeSubPage?: string;
    subPages?: ReactElement;
    direction?: TransitionDirection;
}

const Layout: FunctionComponent<LayoutProps> = ({
    children,
    activeSubPage,
    subPages,
    direction,
}) => {
    return (
        <PageAnimation
            show={subPages !== undefined}
            activeSubPage={activeSubPage}
            direction={direction || "left"}
        >
            <>
                <Page
                    scroll={subPages !== undefined}
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
                {subPages}
            </>
        </PageAnimation>
    );
};
export default Layout;
