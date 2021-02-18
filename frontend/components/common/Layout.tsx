import classNames from "classnames";
import React, { FunctionComponent, ReactElement } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import features from "../../features";
import EnterCodeButton from "./EnterCodeButton";
import Footer from "./Footer";
import Page from "./Page";
import StatusBar from "./StatusBar";

interface PageAnimationProps {
    activeSubPage?: string;
    direction?: TransitionDirection;
    show?: boolean;
}

export type TransitionDirection = "left" | "right";

const PageAnimation: FunctionComponent<PageAnimationProps> = ({
    children,
    activeSubPage,
    direction,
    show,
}) => {
    if (!show) return <>{children}</>;
    return (
        <>
            <style jsx>
                {`
                    .page-animation {
                        // font-size: 12px;
                        // position: absolute;
                        // top: 0;
                        // left: 0;
                        z-index: 10;
                    }

                    // start

                    .page-animation > :global(.page-wrapper) {
                        transition: transform 300ms;
                    }

                    .page-animation.left > :global(.page-wrapper) {
                        transform: translateX(-100vw);
                    }

                    .page-animation.right > :global(.page-wrapper) {
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

                    .page-animation.exit-active.left > :global(.page-wrapper) {
                        transform: translateX(-100vw);
                    }

                    .page-animation.exit-active.right > :global(.page-wrapper) {
                        transform: translateX(100vw);
                    }

                    .page-animation.exit-done > :global(.page-wrapper) {
                        z-index: 1;
                    }

                    .page-animation.exit-done.right > :global(.page-wrapper) {
                        transform: translateX(100vw);
                    }

                    .page-animation.exit-done.left > :global(.page-wrapper) {
                        transform: translateX(-100vw);
                    }

                    // disable transition effect when animation not running
                    // to avoid animating window size changes.
                    .page-animation.enter-done > :global(.page-wrapper),
                    .page-animation.exit-done > :global(.page-wrapper) {
                        transition: none;
                    }

                    // safari fix
                    :global(html),
                    :global(body) {
                        height: 100vh;
                        overflow: hidden;
                    }
                `}
            </style>

            <TransitionGroup component="div" appear>
                <CSSTransition
                    key={activeSubPage || "home"}
                    timeout={300}
                    mountOnEnter={true}
                    unmountOnExit={true}
                >
                    <div className={classNames("page-animation", direction)}>
                        {children}
                    </div>
                </CSSTransition>
            </TransitionGroup>
        </>
    );
};

export interface LayoutProps {
    activeSubPage?: string;
    subPages: ReactElement;
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
            direction={direction}
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
