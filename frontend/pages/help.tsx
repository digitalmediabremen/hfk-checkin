import * as React from "react";
import Title from "../components/common/Title";
import { useTranslation } from "../localization";

interface HelpPageProps {}

const HelpPage: React.FunctionComponent<HelpPageProps> = (props) => {
    const { t } = useTranslation();
    return <Title>{t("Hilfe")}</Title>;
};

export default HelpPage;
