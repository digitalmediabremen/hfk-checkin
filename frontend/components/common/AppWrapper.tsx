import React, { SFC } from "react";
import theme from "../../styles/theme";
import { useAppState } from "./AppStateProvider";

const AppWrapper: SFC = (props) => {
    const { children } = props;
    const { appState }  = useAppState();
    const { error } = appState;
    return (
        <div>
            <style jsx>
                {`
                    div {
                        margin: ${theme.spacing(2)}px;
                    }
                `}
            </style>
            { !!error && error }
            {children}
        </div>
    );
};

export default AppWrapper;
