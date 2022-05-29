import React from "react";
import FormText from "../components/common/FormText";
import Layout from "../components/common/Layout";
import Title from "../components/common/Title";
import { useTranslation } from "../localization";

interface disabledProps {}

interface ContentProps {
    title: string;
}

const ContentDe: React.FunctionComponent<ContentProps> = ({ title }) => (
    <>
        <Title>{title}</Title>
        <FormText paragraph>
            Aufgrund der momentanen Situation ist eine Registrierung über
            Checkin nicht nötig. Nähere Informationen zur Corona-Lage und zur
            Raumbuchung gibt es hier: HFK — FAQ (hfk-bremen.de)
        </FormText>
    </>
);

const ContentEn: React.FunctionComponent<ContentProps> = ({ title }) => (
    <>
        <Title>{title}</Title>
        <FormText paragraph>
            Due to the current situation, registration via Checkin is not
            necessary. More information on the Corona situation and on room
            booking can be found here: HFK — FAQ (hfk-bremen.de)
        </FormText>
    </>
);

const DisabledPage: React.FunctionComponent<disabledProps> = ({}) => {
    const { t, locale } = useTranslation();
    const title =
        locale === "de" ? "Checkin ist deaktiviert" : "Checkin is disabled";
    const Content = locale === "de" ? ContentDe : ContentEn;
    return (
        <>
            <style jsx>{``}</style>
            <Layout title={title}>
                <Content title={title} />
            </Layout>
        </>
    );
};

export default DisabledPage;
