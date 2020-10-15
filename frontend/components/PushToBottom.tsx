import * as React from "react";
import theme from "../styles/theme";

interface IPushToBottomProps {}

const PushToBottom: React.FunctionComponent<IPushToBottomProps> = ({
    children,
}) => {
    const [offsetTop, setOffsetTop] = React.useState<number>(0);
    const measuredRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (measuredRef.current !== null) {
            setOffsetTop(measuredRef.current.getBoundingClientRect().top);
        }
    }, [children]);
    const containerHeight = (() => {
        return `calc(100vh - ${offsetTop}px - 70px)`;
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

                .no-margin {
                    margin: ${-theme.spacing(3)}px 0;
                }
            `}</style>
            <div className="no-margin" ref={measuredRef}>
                <div className="flex">{children}</div>
            </div>
        </>
    );
};

export default PushToBottom;
