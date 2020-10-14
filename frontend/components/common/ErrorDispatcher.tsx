import * as React from "react";
import { useAppState } from "./AppStateProvider";

interface ErrorDispatcherProps {
    error?: string;
    status?: number;
}

const ErrorDispatcher: React.FunctionComponent<ErrorDispatcherProps> = ({
    children,
    error,
    status
}) => {
    const { dispatch } = useAppState();
    React.useEffect(() => {
        if (!!status && status >= 500) throw(error);
        if (!!error)
            dispatch({
                type: "status",
                status: {
                    message: error,
                    isError: true,
                },
            });
    }, [error, status]);

    return <>{children || null}</>;
};

export default ErrorDispatcher;
