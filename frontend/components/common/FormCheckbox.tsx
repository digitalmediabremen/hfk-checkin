import classNames from "classnames";
import React from "react";
import { Square, CheckSquare } from "react-feather";
import useTheme from "../../src/hooks/useTheme";import FormElementBase, { FormElementBaseProps } from "./FormElementBase";

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
    const theme = useTheme();
    const Icon = value ? CheckSquare : Square;

    const handleChange = () => {
        onChange?.(!value);
    };

    return (
        <>
            <style jsx>{`
                .icon {
                    flex: 0 0 ${theme.spacing(5)}px;
                    line-height: 0;
                }

                .label {
                    font-weight: bold;
                    line-height: 1.25em;
                }

                .label.small {
                    font-weight: bold;
                    font-size: 0.75rem;
                    line-height: 1.25em;
                }
            `}</style>
            <FormElementBase
                noOutline
                noPadding
                onClick={handleChange}
                narrow
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
