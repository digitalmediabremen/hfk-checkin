import React from "react";
import { Meh } from "react-feather";
import Layout from "../components/common/Layout";
import Notice from "../components/common/Notice";
import Title from "../components/common/Title";
import { useTranslation } from "../localization";
import useTheme from "../src/hooks/useTheme";

interface ErrorProps {
    error?: string;
}

const Error: React.FunctionComponent<ErrorProps> = ({ error }) => {
    console.error(error);
    const { t } = useTranslation("common");
    const theme = useTheme();
    return (
        <>
            <Layout>
                <Meh
                    color={theme.primaryColor}
                    size={64}
                    strokeWidth={(24 / 64) * 2}
                />
                <br />
                <br />
                <Title>
                    {t("Mist. Da ist was schiefgelaufen.")}
                </Title>
                <Notice>
                {t("Melde dich bei")}{" "}
                            <u><a href="mailto:checkin@hfk-bremen.de">
                                checkin@hfk-bremen.de
                            </a></u>{" "}
                            {t("wenn dieser Fehler häufiger auftritt.")}
                </Notice>
                {error && <pre>{error}</pre>}
            </Layout>
        </>
    );
};

export default Error;
