import * as React from "react";
import { CloudOff } from "react-feather";
import Layout from "../components/common/Layout";
import Title from "../components/common/Title";
import { useTranslation } from "../localization";
import useTheme from "../src/hooks/useTheme";

interface OFflinePageProps {}

const OFflinePage: React.FunctionComponent<OFflinePageProps> = (props) => {
    const theme = useTheme();
    const { t } = useTranslation("common");
    return (
        <Layout>
            <CloudOff
                color={theme.primaryColor}
                size={64}
                strokeWidth={(24 / 64) * 2}
            />
            <br />
            <br />
            <Title>{t("Du bist offline")}</Title>
        </Layout>
    );
};

export default OFflinePage;
