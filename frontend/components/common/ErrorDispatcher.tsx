import * as React from "react";
import { useAppState } from "./AppStateProvider";

interface ErrorDispatcherProps {
    error?: string;
}

const ErrorDispatcher: React.FunctionComponent<ErrorDispatcherProps> = ({
    children,
    error,
}) => {
    const { dispatch } = useAppState();
    React.useEffect(() => {
        if (!!error)
            dispatch({
                type: "status",
                status: {
                    message: error,
                    isError: true,
                },
            });
    }, [error]);

    return <>{children || null}</>;
};

export default ErrorDispatcher;
