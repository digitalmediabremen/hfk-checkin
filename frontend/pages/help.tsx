import * as React from "react";
import Layout from "../components/common/Layout";
import Title from "../components/common/Title";
import HelpContentDe from "../components/help/HelpContent-de";
import HelpContentEn from "../components/help/HelpContent-en";
import { useTranslation } from "../localization";

interface HelpPageProps {}

const HelpPage: React.FunctionComponent<HelpPageProps> = (props) => {
    
    const { t, locale } = useTranslation();
    return (
        <Layout title={t("Hilfe")}>
            <Title>{t("Hilfe")}</Title>
            {locale === "de" && <HelpContentDe />}
            {locale === "en" && <HelpContentEn />}
        </Layout>
    );
};

export default HelpPage;
