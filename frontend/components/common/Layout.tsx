import classNames from "classnames";
import React, {
    FunctionComponent,
    ReactElement,
    ReactNode,
    useEffect,
    useLayoutEffect,
    useRef,
} from "react";
import { use100vh } from "react-div-100vh";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import css from "styled-jsx/css";
import { isClient } from "../../config";
import features from "../../features";
import { TransitionDirection } from "../../src/model/AppState";
import EnterCodeButton from "./EnterCodeButton";
import Footer from "./Footer";
import Page from "./Page";
import StatusBar from "./StatusBar";

interface PageAnimationProps {
    childKey?: string;
    direction: TransitionDirection;
    show?: boolean;
}

const { styles, className } = css.resolve`
    .page-animation {
        z-index: 10;
        overflow: hidden;
    }

    // start

    .page-animation > :global(.page-wrapper) {
        transition: transform 300ms;
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

    :global(.right .page-animation.exit-active > .page-wrapper) {
        transform: translateX(-100vw);
    }

    .page-animation.exit-done > :global(.page-wrapper) {
        z-index: 1;
    }

    :global(.left .page-animation.exit-done > .page-wrapper) {
        transform: translateX(100vw);
    }

    :global(.left .page-animation.exit-done.right > .page-wrapper) {
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
        overflow: hidden;
        position: relative;
    }
`;

const PageTransition: FunctionComponent<PageAnimationProps> = ({
    children,
    childKey,
    direction,
    show,
}) => {
    const height = use100vh();
    const ref = useRef(isClient && document.body);

    useLayoutEffect(() => {
        if (ref.current) {
            ref.current.style.height = `${height}px`;
        }
    }, [height]);

    if (!show) return <>{children}</>;

    return (
        <>
            {styles}
            <TransitionGroup className={direction} component="div" appear>
                <CSSTransition
                    key={childKey}
                    timeout={300}
                    mountOnEnter={true}
                    unmountOnExit={true}
                >
                    <div className={classNames("page-animation", className)}>
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
    children: ReactNode;
}

const Layout: FunctionComponent<LayoutProps> = ({
    children,
    activeSubPage,
    subPages,
    direction,
}) => {
    return (
        <PageTransition
            show={subPages !== undefined}
            childKey={activeSubPage}
            direction={direction || "left"}
        >
            <>
                <Page
                    scroll
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
        </PageTransition>
    );
};
export default Layout;
