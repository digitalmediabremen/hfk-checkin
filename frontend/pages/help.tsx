import * as React from "react";
import Title from "../components/common/Title";
import { useTranslation } from "../localization";
import Notice from "../components/common/Notice";
import Text from "../components/common/Text";
import Subtitle from "../components/common/Subtitle";
import HelpContentDe from "../components/help/HelpContent-de";
import HelpContentEn from "../components/help/HelpContent-en";

interface HelpPageProps {}

const HelpPage: React.FunctionComponent<HelpPageProps> = (props) => {
    const { t, locale } = useTranslation();
    return (
        <>
            <Title>{t("Hilfe")}</Title>
            {locale === "de" && <HelpContentDe />}
            {locale === "en" && <HelpContentEn />}
        </>
    );
};

export default HelpPage;
