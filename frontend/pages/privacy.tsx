import * as React from "react";
import Layout from "../components/common/Layout";
import Title from "../components/common/Title";
import PrivacyContentDe from "../components/privacy/PrivacyContent-de";
import PrivacyContentEn from "../components/privacy/PrivacyContent-en";
import { useTranslation } from "../localization";

interface PrivacyPageProps {}

const PrivacyPage: React.FunctionComponent<PrivacyPageProps> = (props) => {
    const { t, locale } = useTranslation();
    const title = t("Datenschutzinformationen");
    return (
        <Layout title={title}>
            <Title>{title}</Title>
            {locale === "de" && <PrivacyContentDe />}
            {locale === "en" && <PrivacyContentEn />}
        </Layout>
    );
};

export default PrivacyPage;
