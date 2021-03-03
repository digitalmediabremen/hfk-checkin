import * as React from "react";
import smoothscroll from 'smoothscroll-polyfill';
import Layout from "../components/common/Layout";
import Title from "../components/common/Title";
import HelpContentDe from "../components/help/HelpContent-de";
import HelpContentEn from "../components/help/HelpContent-en";
import { isClient } from "../config";
import { useTranslation } from "../localization";

if (isClient) smoothscroll.polyfill();

interface HelpPageProps {}

const HelpPage: React.FunctionComponent<HelpPageProps> = (props) => {
    
    const { t, locale } = useTranslation();
    return (
        <Layout>
            <Title>{t("Hilfe")}</Title>
            {locale === "de" && <HelpContentDe />}
            {locale === "en" && <HelpContentEn />}
        </Layout>
    );
};

export default HelpPage;
