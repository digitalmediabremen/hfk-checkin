import * as Sentry from "@sentry/node";
import React, { Component, ErrorInfo } from "react";
import Error from "../../pages/Error";

export default class ErrorBoundary extends Component<
    {},
    { error: Error | undefined }
> {
    constructor(props: {}) {
        super(props);
        this.state = { error: undefined };
    }

    static getDerivedStateFromError(error: Error) {
        // Update state so the next render will show the fallback UI.
        return { error: error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // You can also log the error to an error reporting service
        //   logErrorToMyService(error, errorInfo);
        Sentry.captureException(error);
    }

    render() {
        if (!!this.state.error) {
            console.error(this.state.error);
            // You can render any custom fallback UI
            return (
                <Error
                    error={
                        this.state.error.toString?.() ||
                        this.state.error.message
                    }
                />
            );
        }

        return this.props.children;
    }
}
