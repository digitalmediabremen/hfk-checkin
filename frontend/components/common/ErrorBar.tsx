import * as React from "react";
import theme from "../../styles/theme";
import { useAppState } from "./AppStateProvider";

interface ErrorBarProps {
}

const ErrorBar: React.FunctionComponent<ErrorBarProps> = () => {
    const { appState, dispatch }  = useAppState();
    const { error } = appState;

    const handleClose = () => {
        dispatch({
            type: "apiError",
            error: undefined
        })
    }
    return (
        <>
            <style jsx>{`
                div {
                    margin: ${theme.spacing(1)}px ${theme.spacing(1)}px;
                    padding: ${theme.spacing(2)}px ${theme.spacing(1)}px;
                    color: ${theme.primaryColor};
                    text-decoration: underline;
                    border: 2px solid ${theme.primaryColor}
                }
            `}</style>
            {!!error && <div onClick={handleClose}>{error}</div>}
        </>
    );
};

export default ErrorBar;
