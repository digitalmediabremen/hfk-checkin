import * as React from "react";
import Title from "../components/common/Title";
import { useTranslation } from "../localization";
import Notice from "../components/common/Notice";
import Subtitle from "../components/common/Subtitle";
import Text from "../components/common/Text";

interface PrivacyPageProps {}

const PrivacyPage: React.FunctionComponent<PrivacyPageProps> = (props) => {
    const { t } = useTranslation();
    return (
        <>
            <Title>{t("Datenschutz")}</Title>
            <Notice>Betreiberin</Notice>
            <Subtitle>
                Hochschule für Künste Bremen<br />
                Am Speicher XI 8<br />
                D-28217 Bremen
            </Subtitle>
            <Text paragraph>
                Vertreten durch den Rektor Prof. Roland Lambrette.
            </Text>
            <Notice>
                Die Erhebung der Daten erfolgt zum Zwecke der Nachverfolgung von Infektionsketten im Zusammenhang mit dem Coronavirus SARS CoV-2. Rechtsgrundlage der Verarbeitung ist Art. 6 Abs. 1 lit. c DSGVO i.V.m. § 5 Abs. 2 Nr. 3, § 8 Achtzehnte Verordnung zum Schutz vor Neuinfektionen mit dem Coronavirus SARS-CoV-2.
            </Notice>
            <Notice>
                Wir verarbeiten Ihre Daten grundsätzlich nur solange, wie sie für die Zwecke, für die sie erhoben worden sind, erforderlich sind. Daher werden Ihre Daten für die Dauer von drei Wochen aufbewahrt und nach Ablauf der Aufbewahrungsfrist vernichtet bzw. gelöscht.
            </Notice>
            <Text paragraph>
                Die <a href="https://www.hfk-bremen.de/sites/default/files/media/2020_info_datenschutz_nutzerinnen_hfk_bremen.pdf" target="_blank">vollständigen Datenschutzbestimmungen</a> dieser Anwendung finden Sie auf der Website der HfK Bremen.
            </Text>
        </>
    );
};

export default PrivacyPage;
