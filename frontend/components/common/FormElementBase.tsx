import React from "react";
import theme from "../../styles/theme";

export interface FormElementBaseProps {
    button?: true;
    noBottomSpacing?: true;
    bottomSpacing?: number;
    extendedWidth?: true;
    onClick?: () => void;
}

const FormElementBase: React.FunctionComponent<FormElementBaseProps> = ({
    button,
    noBottomSpacing,
    bottomSpacing,
    extendedWidth,
    onClick,
    children
}) => {
    const ComponentType = button ? "button" : "div";
    return (
        <>
            <style jsx>{`
                .form-element-base {
                    display: flex;
                    align-items: center;

                    margin-bottom: ${noBottomSpacing ? 0 : theme.spacing(bottomSpacing || 1)}px;
                    margin-left: ${extendedWidth ? -theme.spacing(1.5) + 1 : 0}px;
                    margin-right: ${extendedWidth ? -theme.spacing(1.5) + 1 : 0}px;
                    padding: ${theme.spacing(0.5)}px ${theme.spacing(1)}px;
                    min-height: ${theme.spacing(7)}px;

                    border-radius: ${theme.borderRadius}px;
                    border: 2px solid ${theme.primaryColor};
                    color: ${theme.primaryColor};

                    line-height: 0;
                }
            `}</style>
            <ComponentType onClick={onClick} className="form-element-base">{children}</ComponentType>
        </>
    );
};

export default FormElementBase;
