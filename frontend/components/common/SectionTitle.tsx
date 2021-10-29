import classNames from "classnames";
import React from "react";
import useTheme from "../../src/hooks/useTheme";
import { empty } from "../../src/util/TypeUtil";
interface SectionTitleProps {
    center?: boolean;
    noMarginBottom?: boolean;
    bottomSpacing?: number;
}

const SectionTitle: React.FunctionComponent<SectionTitleProps> = ({
    children,
    center,
    noMarginBottom,
    bottomSpacing,
}) => {
    const theme = useTheme();
    return (
        <>
            <style jsx>{`
                h3 {
                    margin: 0;
                    padding: 0;
                    text-transform: uppercase;
                    color: ${theme.disabledColor};
                    font-size: 0.75rem;
                    line-height: 1.25rem;
                    font-weight: normal;
                    // display: inline;
                }

                h3.margin-bottom {
                    margin-bottom: ${theme.spacing(
                        empty(bottomSpacing) ? 2 : bottomSpacing
                    )}px;
                }

                h3.center {
                    text-align: center;
                }
            `}</style>
            <h3
                className={classNames({
                    center,
                    "margin-bottom": !noMarginBottom,
                })}
            >
                {children}
            </h3>
        </>
    );
};

export default SectionTitle;
