import * as React from "react";

interface EllipseTextProps {}

const EllipseText = React.forwardRef<HTMLSpanElement, EllipseTextProps>(
    ({ children }, ref) => {
        return (
            <>
                <style jsx>{`
                    span {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        display: inline-block;
                        width: 100%;
                        line-height: inherit;
                    }
                `}</style>
                <span ref={ref}>{children}</span>
            </>
        );
    }
);

export default EllipseText;
