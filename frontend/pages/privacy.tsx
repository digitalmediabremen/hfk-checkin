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
                Informationen zur Datenverarbeitung und Datenschutz Im Sinne
                dieser Verordnung bezeichnet der Ausdruck
            </Notice>
            <Text paragraph>
                (1) "betroffene Person" eine bestimmte natürliche Person oder
                eine natürliche Person, die direkt oder indirekt mit Mitteln
                bestimmt werden kann, die der für die Verarbeitung
                Verantwortliche oder jede sonstige natürliche oder juristische
                Person nach allgemeinem Ermessen aller Voraussicht nach
                einsetzen würde, etwa mittels Zuordnung zu einer Kennnummer, zu
                Standortdaten, zu einer Online-Kennung oder zu einem oder
                mehreren besonderen Merkmalen, die Ausdruck ihrer physischen,
                physiologischen, genetischen, psychischen, wirtschaftlichen,
                kulturellen oder sozialen Identität sind;
            </Text>
            <Text paragraph>
                (2) "personenbezogene Daten" alle Informationen, die sich auf
                eine bestimmte oder bestimmbare natürliche Person ("betroffene
                Person") beziehen; bestimmbar ist eine Person, die identifiziert
                werden kann, direkt oder indirekt, etwa mittels Zuordnung zu
                einer Kennnummer, zu Standortdaten, zu einer eindeutigen Kennung
                oder zu einem oder mehreren besonderen Merkmalen, die Ausdruck
                ihrer physischen, physiologischen, genetischen, psychischen,
                wirtschaftlichen, kulturellen oder sozialen oder
                geschlechtlichen Identität sind;
            </Text>{" "}
            <Text paragraph>
                (2a) "pseudonyme Daten" persönliche Daten, die ohne die
                Verwendung von zusätzlichen Information nicht einer bestimmten
                betroffenen Person zugeordnet werden können, solange solche
                zusätzlichen Informationen separat aufbewahrt werden und falls
                technische und organisatorische Maßnahmen die Nicht-Zuordnung
                sicherstellen; (2b) "verschlüsselte Daten" persönliche Daten,
                die durch technische Schutzmaßnahmen für jede Personen
                unkenntlich gemacht sind, die nicht zugangsberechtigt ist;
            </Text>
        </>
    );
};

export default PrivacyPage;
