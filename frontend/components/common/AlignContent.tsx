import useResizeObserver from "@react-hook/resize-observer";
import * as React from "react";
import useTheme from "../../src/hooks/useTheme";
type AlignOptions = "center" | "bottom";

interface IPushToBottomProps {
    offsetBottomPadding?: true;
    align?: AlignOptions;
    noFooter?: true;
}

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
    };

    function updateContainerHeight(offsetTop: number) {
        const footerHeight = noFooter ? 0 : theme.footerHeight();
        const heightString = `calc(100vh - ${
            offsetTop + footerHeight + theme.spacing(2)
        }px)`;
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
