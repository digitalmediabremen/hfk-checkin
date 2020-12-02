import * as React from "react";
import smoothscroll from 'smoothscroll-polyfill';
import Title from "../components/common/Title";
import HelpContentDe from "../components/help/HelpContent-de";
import HelpContentEn from "../components/help/HelpContent-en";
import { useTranslation } from "../localization";

smoothscroll.polyfill();

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
