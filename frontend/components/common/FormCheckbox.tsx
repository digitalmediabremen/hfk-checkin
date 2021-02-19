import classNames from "classnames";
import React from "react";
import { Square, CheckSquare } from "react-feather";
import theme from "../../styles/theme";
import FormElementBase, { FormElementBaseProps } from "./FormElementBase";

interface FormCheckboxProps
    extends Omit<FormElementBaseProps, "noOutline" | "onClick"> {
    value: boolean;
    onChange?: (value: boolean) => void;
    label: string;
    small?: boolean;
}

const FormCheckbox: React.FunctionComponent<FormCheckboxProps> = ({
    value,
    onChange,
    label,
    small,
    ...formElementBaseProps
}) => {
    const Icon = value ? CheckSquare : Square;

    const handleChange = () => {
        onChange?.(!value);
    };

    return (
        <>
            <style jsx>{`
                .icon {
                    flex: 0 0 ${theme.spacing(5)}px;
                }

                .label {
                    font-weight: bold;
                    line-height: 1.3em;
                }

                .label.small {
                    font-weight: bold;
                    font-size: 12px;
                    line-height: 1.3em;
                }
            `}</style>
            <FormElementBase
                noOutline
                onClick={handleChange}
                {...formElementBaseProps}
            >
                <span className="icon">
                    <Icon />
                </span>
                <span className={classNames("label", {small})}>{label}</span>
            </FormElementBase>
        </>
    );
};

export default FormCheckbox;
