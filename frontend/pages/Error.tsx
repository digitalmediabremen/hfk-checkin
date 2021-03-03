import React from "react";
import Layout from "../components/common/Layout";
import Title from "../components/common/Title";

interface ErrorProps {
    error: string;
}

const Error: React.FunctionComponent<ErrorProps> = ({ error }) => {
    return (
        <>
            <Layout>
                <Title
                    subtext={
                        <>
                            Contact{" "}
                            <a href="mailto:checkin@hfk-bremen.de">
                                checkin@hfk-bremen.de
                            </a>{" "}
                            if the problem persists.
                        </>
                    }
                >
                    Something went wrong.
                </Title>
                <pre>{error}</pre>
            </Layout>
        </>
    );
};

export default Error;
