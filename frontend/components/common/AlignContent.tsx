import * as React from "react";
import theme from "../../styles/theme";

interface IPushToBottomProps {
    offsetBottomPadding?: true;

}

const AlignContent: React.FunctionComponent<IPushToBottomProps> = ({
    children,
    offsetBottomPadding
}) => {
    const [offsetTop, setOffsetTop] = React.useState<number>(0);
    const measuredRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (measuredRef.current !== null) {
            setOffsetTop(measuredRef.current.getBoundingClientRect().top);
        }
    }, [children]);
    const containerHeight = (() => {
        return `calc(100vh - ${offsetTop + theme.footerHeight + theme.spacing(2)}px)`;
    })();
    return (
        <>
            <style jsx>{`
                .flex {
                    display: flex;
                    align-items: flex-end;
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
