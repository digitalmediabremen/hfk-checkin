import * as React from "react";
import Title from "../components/common/Title";
import { useTranslation } from "../localization";

interface HelpPageProps {}

const HelpPage: React.FunctionComponent<HelpPageProps> = (props) => {
    const { t } = useTranslation();
    return (
        <>
            <Title>{t("Hilfe")}</Title>
            <Notice>Unterstzung Checkin-Anwendung</Notice>
            <Text paragraph>
                Bitte melde Dich bei Fragen zur Anwendung und zur Protokollierung und Raumbeschilderungen, sowie Problemhinweisen bitte bei:<br/>
                <a href="mailto:checkin@hfk-bremen.de">checkin@hfk-bremen.de</a><br/>
                Die Anwendung und das neue Zugangsverfahren befinden sich momentan in einem Test.<br/><br/>
                In der ersten Woche unterstützt der AStA freundlicherweise alle Nutzer*innen bei Fragen und Problemen vor dem Speicher am Chaos Office und unter <a href="tel:+4942195951060">0421 9595-1060</a>.
            </Text>
            <Notice>Weiterführende Informationen</Notice>
            <Text paragraph>
                Jeweils aktuelle Informationen zu den Corona-Maßnahmen und Hygieneregeln findest du in deinem HfK-Postfach und unter <a href="https://www.hfk-bremen.de/corona-info" target="_blank">hfk-bremen.de/corona-info</a>. Bitte bleibe Informiert!
            </Text>
        </>
    );
};

export default HelpPage;
