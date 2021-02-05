import * as React from "react";
import Title from "../components/common/Title";
import { useTranslation } from "../localization";
import Notice from "../components/common/Notice";
import Subtitle from "../components/common/Subtitle";
import Text from "../components/common/Text";
import PrivacyContentDe from "../components/privacy/PrivacyContent-de";
import PrivacyContentEn from "../components/privacy/PrivacyContent-en";
import Page from "../components/common/Page";

interface PrivacyPageProps {}

const PrivacyPage: React.FunctionComponent<PrivacyPageProps> = (props) => {
    const { t, locale } = useTranslation();
    return (
        <Page>
            <Title>{t("Datenschutzinformationen")}</Title>
            {locale === "de" && <PrivacyContentDe />}
            {locale === "en" && <PrivacyContentEn />}
        </Page>
    );
};

export default PrivacyPage;
