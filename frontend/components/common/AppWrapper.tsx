import React, { SFC } from "react";
import theme from "../../styles/theme";
import { useAppState } from "./AppStateProvider";
import ErrorBar from "./ErrorBar";

const AppWrapper: SFC = (props) => {
    const { children } = props;
    return (
        <>
            <ErrorBar />
            <div>
                <style jsx>
                    {`
                        div {
                            margin: ${theme.spacing(3)}px;
                        }
                    `}
                </style>
                {children}
            </div>
        </>
    );
};

export default AppWrapper;
