import React from "react";
import { AlertCircle } from "react-feather";
import Status from "../../src/model/Status";
import Bar from "./Bar";
import FormElement from "./FormElement";

interface StatusBarProps {
    status: Status;
}

const StatusBar: React.FunctionComponent<StatusBarProps> = ({ status }) => {
    return (
        <>
            <style jsx>{``}</style>
            <Bar extendedWidth maxWidth>
                <FormElement
                    above
                    primary
                    componentType="a"
                    value={<b>{status.message}</b>}
                    // noOutline
                    labelIcon={
                        status.isError ? (
                            <AlertCircle strokeWidth={2} />
                        ) : undefined
                    }
                    // noPadding
                    noBottomSpacing
                    narrow
                    maxRows={10}
                />
            </Bar>
        </>
    );
};

export default StatusBar;
