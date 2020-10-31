import React from "react";
import Notice from "../common/Notice";
import Subtitle from "../common/Subtitle";
import Text from "../common/Text";

const HelpContentDe = () => {
    return (
        <>
            <Notice>
                Auf der Suche nach einer QR-Scanner-App? Siehe unten.
            </Notice>
            <Subtitle>Unterstützung Checkin-Anwendung</Subtitle>
            <Text paragraph>
                Bitte melde Dich bei Fragen zur Anwendung und zur
                Protokollierung und Raumbeschilderungen, sowie Problemhinweisen
                bei:
                <br />
                <br />
                <strong>
                    <a href="mailto:checkin@hfk-bremen.de">
                        checkin@hfk-bremen.de
                    </a>
                </strong>
                <br />
                <br />
                Die Anwendung und das neue Zugangsverfahren befinden sich
                momentan in einem Testbetrieb.
            </Text>
            <Subtitle>Weiterführende Informationen</Subtitle>
            <Text paragraph>
                Jeweils aktuelle Informationen zu den Corona-Maßnahmen und
                Hygieneregeln findest du in deinem HfK-Postfach und unter{" "}
                <a href="https://www.hfk-bremen.de/corona-info" target="_blank">
                    hfk-bremen.de/corona-info
                </a>
                . Bitte bleibe Informiert!
            </Text>
            <Subtitle>QR-Scanner-App-Empfehlungen</Subtitle>
            <Text paragraph>
                iOS und Android können seit 2017 QR-Codes mit der
                Standard-Kamara-App scannen. Falls du eine zusätzliche App
                benötigst, nutze gerne eine der folgenden{" "}
                <strong>kostenlosen und werbefreien QR-Scanner-Apps</strong>:
                <br />
                <br />
                auf Apple iOS:{" "}
                <a href="https://apps.apple.com/de/app/qrs-clean-fast-qr-scanner/id1042620761">
                    QRs App
                </a>
                <br />
                auf Android:{" "}
                <a href="https://play.google.com/store/apps/details?id=de.markusfisch.android.binaryeye">
                    Binary Eye App
                </a>
                <br />
                <br />
                <i>
                    Hinweis: Es gelten die Nutzungsbedingungen der jeweiligen
                    Anbieter und App-Stores. Trotz sorgfältiger Prüfung kann die
                    HfK Bremen keine Verantwortung für die Apps und verlinkten
                    Websites übernehmen.
                </i>
            </Text>
        </>
    );
};

export default HelpContentDe;
