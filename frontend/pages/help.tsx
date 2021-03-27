import * as React from "react";
import Layout from "../components/common/Layout";
import Notice from "../components/common/Notice";
import Text from "../components/common/Text";
import Title from "../components/common/Title";
import GetinHelpContentDe from "../components/help/GetinHelpContent-de";
import HelpContentDe from "../components/help/HelpContent-de";
import HelpContentEn from "../components/help/HelpContent-en";
import { isServer } from "../config";
import featureMap from "../features";
import { useTranslation } from "../localization";

interface HelpPageProps {}

const HelpPage: React.FunctionComponent<HelpPageProps> = (props) => {
    const { t, locale } = useTranslation();
    return (
        <Layout title={t("Hilfe")}>
            <Title>{t("Hilfe")}</Title>

            {locale === "de" && featureMap.getin && <GetinHelpContentDe />}
            {locale === "en" && featureMap.getin && (
                <>
                    <div>
                        <div>
                            <Notice
                                error
                                title="An english translation will follow shortly."
                                bottomSpacing={4}
                                key="test"
                            />
                        </div>
                    </div>
                    <GetinHelpContentDe />
                </>
            )}
            {locale === "de" && featureMap.checkin && <HelpContentDe />}
            {locale === "en" && featureMap.checkin && <HelpContentEn />}
        </Layout>
    );
};

export default HelpPage;
