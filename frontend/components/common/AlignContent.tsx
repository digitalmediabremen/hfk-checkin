import useResizeObserver from "@react-hook/resize-observer";
import * as React from "react";
import { use100vh } from "react-div-100vh";
import useTheme from "../../src/hooks/useTheme";
type AlignOptions = "top" | "center" | "bottom";

interface IPushToBottomProps {
    offsetBottomPadding?: true;
    align?: AlignOptions;
    noFooter?: true;
}

export interface AvailableHeightProps {
    noFooter?: true;
    children: (heightCssValue: string) => React.ReactNode;
}

export const AvailableHeight: React.FunctionComponent<AvailableHeightProps> = ({
    children,
    noFooter,
}) => {
    const theme = useTheme();
    const [containerHeight, setContainerHeight] = React.useState<string>();
    const measuredRef = React.useRef<HTMLDivElement>(null);
    const appHeight = use100vh();

    function updateContainerHeight(offsetTop: number) {
        const footerHeight = noFooter ? 0 : theme.footerHeight();
        const heightString = `calc(${
            appHeight ? `${appHeight}px` : "100vh"
        } - ${offsetTop + footerHeight + theme.spacing(2)}px)`;
        setContainerHeight(heightString);
    }

    React.useEffect(() => {
        if (measuredRef.current === null) return;
        updateContainerHeight(measuredRef.current.getBoundingClientRect().top);
    });

    return (
        <div ref={measuredRef}>
            {containerHeight ? children(containerHeight) : null}
        </div>
    );
};

const AlignContent: React.FunctionComponent<IPushToBottomProps> = ({
    children,
    offsetBottomPadding,
    align: _align,
    noFooter,
}) => {
    const theme = useTheme();
    const [containerHeight, setContainerHeight] = React.useState<string>();
    const measuredRef = React.useRef<HTMLDivElement>(null);
    const align = _align || "bottom";
    const alignCss = {
        center: "center",
        bottom: "flex-end",
        top: "flex-start",
    };
    const appHeight = use100vh();

    function updateContainerHeight(offsetTop: number) {
        const footerHeight = noFooter ? 0 : theme.footerHeight();
        const heightString = `calc(${
            appHeight ? `${appHeight}px` : "100vh"
        } - ${offsetTop + footerHeight + theme.spacing(2)}px)`;
        setContainerHeight(heightString);
    }

    React.useLayoutEffect(() => {
        if (measuredRef.current === null) return;
        updateContainerHeight(measuredRef.current.getBoundingClientRect().top);
    });

    return (
        <div ref={measuredRef}>
            <style jsx>{`
                .flex {
                    --offset: ${containerHeight};
                    display: flex;
                    align-items: ${alignCss[align]};
                    justify-content: center;
                    min-height: var(--offset);
                }

                .offset-bottom-padding {
                    transform: translateY(${theme.spacing(2)}px);
                }
            `}</style>
            <div
                className={`flex ${
                    offsetBottomPadding ? "offset-bottom-padding" : ""
                }`}
            >
                {children}
            </div>
        </div>
    );
};

export default AlignContent;
