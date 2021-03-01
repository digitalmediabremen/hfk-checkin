import classNames from "classnames";
import React from "react";
import theme from "../../styles/theme";

interface SectionTitleProps {
    center?: boolean;
    noMarginBottom?: boolean;
}

const SectionTitle: React.FunctionComponent<SectionTitleProps> = ({
    children,
    center,
    noMarginBottom,
}) => {
    return (
        <>
            <style jsx>{`
                h3 {
                    margin: 0;
                    padding: 0;
                    text-transform: uppercase;
                    color: ${theme.disabledColor};
                    font-size: 0.75rem;
                    font-weight: normal;
                }

                h3.margin-bottom {
                    margin-bottom: ${theme.spacing(2)}px;
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
