import React, { Fragment, FunctionComponent, ReactNode } from "react";
import css from "styled-jsx/css";

const { className, styles } = css.resolve`
    * {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: inherit; 
    }
`;

interface EllipseTextProps {
    children: (className: string) => ReactNode;
}

const EllipseText: FunctionComponent<EllipseTextProps> = ({children}) => {
    return (
        <>
            {children(className)}
            {styles}
        </>
    );
};

export default EllipseText;
