import classNames from "classnames";
import React from "react";
import theme from "../../styles/theme";

interface SectionTitleProps {
    children: string;
    center?: boolean;
}

const SectionTitle: React.FunctionComponent<SectionTitleProps> = ({
    children,
    center,
}) => {
    return (
        <>
            <style jsx>{`
                h3 {
                    margin: 0;
                    padding: 0;
                    text-transform: uppercase;
                    color: ${theme.disabledColor};
                    font-size: 12px;
                    margin-bottom: ${theme.spacing(2)}px;
                    font-weight: normal;
                }

                h3.center {
                    text-align: center;
                }
            `}</style>
            <h3 className={classNames({ center })}>{children}</h3>
        </>
    );
};

export default SectionTitle;
