import * as React from "react";
import Title from "../components/common/Title";
import { useTranslation } from "../localization";

interface PrivacyPageProps {}

const PrivacyPage: React.FunctionComponent<PrivacyPageProps> = (props) => {
    const { t } = useTranslation();
    return <Title>{t("Datenschutz")}</Title>;
};

export default PrivacyPage;
