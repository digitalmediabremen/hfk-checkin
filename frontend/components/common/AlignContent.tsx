import * as React from "react";
import useTheme from "../../src/hooks/useTheme";
type AlignOptions = "center" | "bottom";

interface IPushToBottomProps {
    offsetBottomPadding?: true;
    align?: AlignOptions;
}

const AlignContent: React.FunctionComponent<IPushToBottomProps> = ({
    children,
    offsetBottomPadding,
    align: _align
}) => {
    const theme = useTheme();
    const [offsetTop, setOffsetTop] = React.useState<number>(0);
    const measuredRef = React.useRef<HTMLDivElement>(null);
    const align = _align || "bottom";
    const alignCss = {
        "center": "center",
        "bottom": "flex-end",
    }

    React.useEffect(() => {
        if (measuredRef.current !== null) {
            setOffsetTop(measuredRef.current.getBoundingClientRect().top);
        }
    }, [children]);
    const containerHeight = (() => {
        return `calc(100vh - ${offsetTop + theme.footerHeight() + theme.spacing(2)}px)`;
    })();
    return (
        <>
            <style jsx>{`
                .flex {
                    display: flex;
                    align-items: ${alignCss[align]};
                    justify-content: center;
                    min-height: ${containerHeight};
                }

                .offset-bottom-padding {
                    transform: translateY(${theme.spacing(2) }px);
                }
            `}</style>
            <div ref={measuredRef}>
                <div className={`flex ${offsetBottomPadding ? "offset-bottom-padding" : ""}`}>{children}</div>
            </div>
        </>
    );
};

export default AlignContent;
