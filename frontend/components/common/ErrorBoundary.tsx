import { Component, ErrorInfo } from "react";
import Title from "./Title";
import theme from "../../styles/theme";

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
    }

    render() {
        if (!!this.state.error) {
            console.error(this.state.error);
            // You can render any custom fallback UI
            return (
                <div>
                    <style jsx>{`
                        div {
                            margin: ${theme.spacing(3)}px;
                        }

                        a {
                            text-decoration: underline;
                        }

                        pre {
                            color: ${theme.primaryColor};
                        }
                    `}</style>

                    <Title subtext={<>Contact <a href="mailto:checkin@hfk-bremen.de">checkin@hfk-bremen.de</a> if the problem persists.</>}>Something went wrong.</Title>
                    <pre>
                        {this.state.error.toString?.() || this.state.error}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }
}
