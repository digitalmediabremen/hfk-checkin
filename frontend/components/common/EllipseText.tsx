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
                    }
                `}</style>
                <span ref={ref}>{children}</span>
            </>
        );
    }
);

export default EllipseText;
