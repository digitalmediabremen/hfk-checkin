import React from "react";
import useTheme from "../../src/hooks/useTheme";

interface NewFormGroupProps {
    bottomSpacing?: number;
}

const NewFormGroup: React.FunctionComponent<NewFormGroupProps> = ({
    children,
}) => {
    const theme = useTheme();
    return (
        <>
            <style jsx>{`
                .form-group {
                    display: flex;
                    flex-wrap: wrap;
                }

                .form-group > div {
                    margin-right: ${theme.spacing(2)}px;
                    margin-bottom: ${theme.spacing(1)}px;
                }

                .form-group > div:last-child {
                    margin-right: 0;
                    margin-bottom: 0;
                }
            `}</style>
            <div className="form-group">
                {React.Children.map(children, (child) => (
                    <div>{child}</div>
                ))}
            </div>
        </>
    );
};

export default NewFormGroup;
