import React, { ReactNode } from "react";
import FormElement, { FormElementProps } from "./FormElement";
import SubPage, { SubPageProps } from "./SubPage";

interface FormElementWithSubpageProps extends Omit<FormElementProps, "arrow"> {
    subPageContent: () => ReactNode;
    subPageActive: boolean;
    onSubPageBack: () => void;
    subPageTitle: string;
}

const FormElementWithSubpage: React.FunctionComponent<FormElementWithSubpageProps> = ({
    subPageContent,
    subPageActive,
    onSubPageBack,
    subPageTitle,
    ...formElementProps
}) => {
    return (
        <>
            <style jsx>{``}</style>
            <FormElement {...formElementProps} arrow />
            {subPageActive && (
                <SubPage
                    title={subPageTitle}
                    onBack={onSubPageBack}
                >
                    {() => subPageContent()}
                </SubPage>
            )}
        </>
    );
};

export default FormElementWithSubpage;
