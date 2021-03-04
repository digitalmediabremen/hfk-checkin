import React from "react";
import Notice from "../common/Notice";
import Subtitle from "../common/Subtitle";
import Text from "../common/Text";
import QRIcon from "../common/QRIcon";
import HelpSection, { useOnlyOneOpen } from "./HelpSection";

const HelpContentDe = () => {
    const openPropsProvider = useOnlyOneOpen(true);
    return (
        <>
            <style jsx>
                {`
                    a {
                        text-decoration: underline;
                    }
                `}
            </style>
            <Notice>
                Auf der Suche nach einer QR-Scanner-App? Siehe Abschnitt 5.
            </Notice>
            <HelpSection
                {...openPropsProvider(1)}
                title="1. Wie funktioniert der Checkin und Checkout?"
            >
                <Text paragraph>
                    Sobald du dich registriert hast, kannst du selbstständig auf
                    dieser Website ein Aufenthaltsprotokoll mit deinem
                    Smartphone führen. Es ist keine Installation einer App
                    nötig. Der Dienst funktioniert auch auf PCs und Tablets.
                    <br />
                    <br />
                    Scanne an jedem Standort den QR-Code <strong>
                        oder
                    </strong>{" "}
                    gib den vierstelligen Raumcode ein.
                    <br />
                    <br />
                    Dadurch entsteht im Laufe deines Besuchs ein Protokoll,
                    welches im Falle einer Infektionsnachverfolgung verwendet
                    wird.
                    <br />
                    <br />
                    Vergiss beim Verlassen der jeweiligen Räume und auch beim
                    Verlassen des Gebäudes bitte nicht dich auszuchecken!
                </Text>
            </HelpSection>
            <HelpSection
                {...openPropsProvider(2)}
                title="2. Wann muss ich mich einchecken?"
            >
                <Text paragraph>
                    Bitte checke beim Betreten des Gebäudes, sowie in jedem
                    Raum, ein. Falls Du mehrere Räume zu gleich nutzt, ist es
                    möglich in allen eingecheckt zu sein.
                </Text>
            </HelpSection>
            <HelpSection
                {...openPropsProvider(3)}
                title="3. Wann muss ich mich auschecken? Werde ich automatisch ausgecheckt?"
            >
                <Text paragraph>
                    Bitte checke aus, wenn Du den Raum verlässt. Kurze
                    Unterbrechungen, z.B. Toilettenbesuche müssen nicht
                    protokolliert werden, solange es nicht zu Kontakten mit
                    anderen Personen kommt. Automatische Checkouts finden nicht
                    statt. Checkins verfallen nach 24 Stunden.
                </Text>
            </HelpSection>
            <HelpSection
                {...openPropsProvider(4)}
                title="4. Muss ich weiterhin Räume buchen?"
            >
                <Text paragraph>
                    Ja, für eine Nutzung von Büros, Ateliers, Überäumen und Werkstätten ist
                    die Buchung weiterhin erforderlich. Spontane und
                    unangemeldete Nutzungen sind für ausgewählte Räume möglich.
                    z.B. die Bibliothek, Teeküchen (Speicher XI) und die Mensa.
                </Text>
            </HelpSection>
            <HelpSection
                {...openPropsProvider(5)}
                title="5. Brauche ich einen QR-Code-Scanner?"
            >
                <Text paragraph>
                    Nein. Checkins sind über 4-stellige Nummerncodes oder
                    QR-Codes möglich. Eine Benutzung des Dienstes ist ohne
                    QR-Scanner möglich. Es wird lediglich ein Webbrowser und
                    eine aktive Internetverbindung benötigt.
                </Text>
            </HelpSection>
            <HelpSection
                {...openPropsProvider(6)}
                title="6. Wie kann ich QR-Codes scannen?"
            >
                <Text paragraph>
                    iOS und Android können seit 2017 QR-Codes mit der
                    Standard-Kamara-App scannen. Falls du eine zusätzliche App
                    benötigst, nutze gerne eine der folgenden{" "}
                    <strong>kostenlosen und werbefreien QR-Scanner-Apps</strong>
                    :
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
                        Hinweis: Es gelten die Nutzungsbedingungen der
                        jeweiligen Anbieter und App-Stores. Trotz sorgfältiger
                        Prüfung kann die HfK Bremen keine Verantwortung für die
                        Apps und verlinkten Websites übernehmen.
                    </i>
                </Text>
            </HelpSection>
            <HelpSection
                {...openPropsProvider(7)}
                title="
                7. Wie kann ich schneller auf die Anwendung zugreifen?"
            >
                <Text paragraph>
                    Füge die Webanwendung wie eine reguläre App zum Homescreen
                    deines Smartphones hinzu. Dieses funktioniert wie ein
                    schneller Zugriff per Lesezeichen.
                    <br />
                    <br />
                    Unter Apple iOS:
                    <ol>
                        <li>
                            Öffne <i>Safari</i>
                        </li>
                        <li>Besuche checkin.hfk-bremen.de</li>
                        <li>
                            Nutze die Funktion <i>Teilen</i> (&#x2191;) in der
                            mitte der Funktionsleiste am unteren Bildschirmrand.
                        </li>
                        <li>
                            Wähle <i>Zum Home-Bildschirm</i>.
                        </li>
                    </ol>
                    Unter Android mit Chrome oder Firefox:
                    <ol>
                        <li>
                            Öffne <i>Chrome</i> oder <i>Firefox</i>
                        </li>
                        <li>Besuche checkin.hfk-bremen.de</li>
                        <li>
                            Tippe am unten am Bildschirm auf die
                            Menüschaltfläche (&#8942;).
                        </li>
                        <li>
                            Wähle <i>Zum Startbildschirm hinzufügen</i>.
                        </li>
                    </ol>
                </Text>
            </HelpSection>
            <HelpSection
                {...openPropsProvider(8)}
                title="8. Fragen zu oder Probleme mit der Checkin-Anwendung?"
            >
                <Text paragraph>
                    Bitte melde dich bei Fragen zur Anwendung und zur
                    Protokollierung und Raumbeschilderungen, sowie
                    Problemhinweisen bei:
                    <br />
                    <br />
                    <a href="mailto:checkin@hfk-bremen.de">
                        checkin@hfk-bremen.de
                    </a>
                </Text>
            </HelpSection>
            <HelpSection
                {...openPropsProvider(9)}
                title="9. Weiterführende Informationen zu Corona"
            >
                <Text paragraph>
                    Viele Antworten zum Studium ab dem WiSe 2020 an der HfK
                    wurden auf{" "}
                    <a href="https://faq.hfk-bremen.de/">faq.hfk-bremen.de</a>{" "}
                    zusammengestellt. Bitte lese dort nach.
                    <br />
                    <br />
                    Jeweils aktuelle und verbindliche Informationen zu den
                    Corona-Maßnahmen und Hygieneregeln findest du in deinem
                    HfK-Postfach und unter{" "}
                    <a
                        href="https://www.hfk-bremen.de/corona-info"
                        target="_blank"
                    >
                        hfk-bremen.de/corona-info
                    </a>
                    .<br />
                    Bitte bleibe Informiert!
                </Text>
            </HelpSection>
        </>
    );
};

export default HelpContentDe;
