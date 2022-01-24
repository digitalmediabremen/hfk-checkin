import React from "react";
import Notice from "../common/Notice";
import FormText from "../common/FormText";
import HelpSection, { useOnlyOneOpen } from "./HelpSection";

interface GetinHelpContentDeProps {}

const GetinHelpContentDe: React.FunctionComponent<GetinHelpContentDeProps> = ({}) => {
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
            <HelpSection
                {...openPropsProvider(1)}
                title="1. Welche Fristen muss ich bei meiner Anfrage berücksichtigen?"
            >
                <FormText paragraph>
                    Räume können max. 14 Tage im Voraus gebucht werden. Diese
                    Regel gilt nicht für Prüflinge!
                    <br />
                    Die Bearbeitungszeit für Raumanfragen kann bis zu 48 h
                    betragen.
                    <br />
                    Die Werkstattleitungen und Bürobesitzer*innen bearbeiten am
                    Wochenende in der Regel keine Anfragen. Willst du also eine
                    Werkstatt für Montag um 10 Uhr buchen, stelle deine Anfrage
                    bis spätestens Donnerstag 10 Uhr.
                </FormText>
            </HelpSection>
            <HelpSection
                {...openPropsProvider(2)}
                title="2. Kann ich einen Raum für einen längeren Zeitraum buchen?"
            >
                <FormText paragraph>
                    Räume werden max. für einen Zeitraum von bis zu 7 Tagen am
                    Stück vergeben.
                </FormText>
            </HelpSection>
            <HelpSection
                {...openPropsProvider(3)}
                title="3. Woher weiß ich, dass meine Anfrage bestätigt wurde?"
            >
                <FormText paragraph>
                    Wenn du in Getin oben links auf deinen Namen klickst, siehst
                    du alle deine Anfragen. Zu jeder Anfrage siehst du hier den
                    aktuellen Buchungsstatus „angefragt“, „bestätigt“ oder
                    „abgelehnt“.
                    <br />
                    Über jede Veränderung an deiner Buchungsanfrage bzw. Buchung
                    wirst du per E-Mail an dein HfK-Postfach informiert.
                </FormText>
            </HelpSection>
            <HelpSection
                {...openPropsProvider(4)}
                title="4. Warum wurde meine Buchung abgelehnt?"
            >
                <FormText paragraph>
                    {" "}
                    Buchungen werden immer dann abgelehnt, wenn der gewünscht
                    Zeitraum schon belegt ist, oder weil deine Anfrage nicht zu
                    dem Raum passt. In der Regel solltest du bei einer Ablehnung
                    eine entsprechende Rückmeldung von der raumverantwortlichen
                    Person erhalten.{" "}
                </FormText>
            </HelpSection>
            <HelpSection
                {...openPropsProvider(5)}
                title="5. Kann ich Raumanfragen und Raumbuchungen nachträglich ändern?"
            >
                <FormText paragraph>
                    Ja und nein.
                    <br />
                    <br />
                    Einmal abgeschickt oder bestätigt, sind deine Raumanfrage
                    und deine Raumbuchung in Bearbeitung und können über die
                    Getin nur von dir storniert werden. Du kannst Raumanfragen
                    und Raumbuchungen stornieren und neu beantragen. Aber, du
                    kannst zum Beispiel die Uhrzeit von Anfragen oder Buchungen
                    im Kontakt mit den buchungsverantwortlichen Personen ändern,
                    bitte verwende hierfür die Getin-Mails.
                </FormText>
            </HelpSection>
            <HelpSection
                {...openPropsProvider(6)}
                title="6. Wie kann ich meine Raumbuchung stornieren?"
            >
                <FormText paragraph>
                    Klicke in Getin auf „Buchungsanfragen“ und dort auf die
                    Buchung oder Anfrage, die du stornieren willst. Klicke auf
                    „Stornieren“.
                </FormText>
            </HelpSection>
            <HelpSection
                {...openPropsProvider(7)}
                title="7. Wie bekomme ich eine Zugangsberechtigung für einen Raum?"
            >
                <FormText paragraph>
                    Die raumverantwortliche Person muss dich in Getin
                    freischalten. Sobald du einen Raum mit Zugangsbeschränkung
                    anfragst, für den du keine Berechtigung hast, leitet Getin
                    diese Anfrage an die raumverantwortliche Person weiter.{" "}
                    <br />
                    Du kannst auch vorab mit der raumverantwortlichen Person,
                    bspw. deiner Professorin, besprechen, dass sie dich in Getin
                    freischaltet, sodass du ihren Raum buchen kannst.{" "}
                </FormText>
            </HelpSection>
            {/* <HelpSection
                {...openPropsProvider(1)}
                title="8. Ich weiß nicht, welcher Raum der für meine Zwecke geeignet ist, was tun?"
            >
                <Text paragraph>Ich weiß nicht, welcher Raum der für meine Zwecke geeignet ist, was tun? 
Fülle das Formular aus und wähle in der Raumliste „unbestimmter Raum“. Du kannst dann im Textfeld kurz beschreiben, was du vorhast (Probe für Performance, Gruppenarbeit, Arbeiten allein usw.), ober was der Raum bieten muss (z.B. Größe des Raumes, Anzahl der erlaubten Personen usw.).  
Deine Anfrage geht dann an das Raum-Team, das dir einen geeigneten Raum vorschlägt. </Text>
            </HelpSection> */}
            <HelpSection
                {...openPropsProvider(8)}
                title="8. Muss ich weiterhin Checkin benutzen?"
            >
                <FormText paragraph>
                    <b>Ja.</b>
                    <br />
                    <br />
                    Mit Getin buchst Du Räume im Speicher XI und vor Ort
                    dokumentierst du deine Anwesenheit mit Checkin selbst.{" "}
                </FormText>
            </HelpSection>
            <HelpSection
                {...openPropsProvider(9)}
                title="9. Das Formular funktioniert nicht. Was jetzt?"
            >
                <FormText paragraph>
                    Bitte schreibe eine Mail an{" "}
                    <a href="mailto:getin@hfk-bremen.de">getin@hfk-bremen.de</a>{" "}
                    und schildere dein Problem. Du wirst schnellstmöglich eine
                    Rückmeldung erhalten. <br />
                    Deine Buchungsanfrage kannst du in der Zwischenzeit per Mail
                    an{" "}
                    <a href="mailto:raum_kud@hfk-bremen.de">
                        raum_kud@hfk-bremen.d
                    </a>{" "}
                    schicken.
                </FormText>
            </HelpSection>
            <HelpSection
                {...openPropsProvider(10)}
                title="10. Fragen oder Feedback?"
            >
                <FormText paragraph>
                    Fragen oder Feedback zur Selbst-Dokumentation mit Checkin
                    werden unter Punkt 10 „Checkin“ beantwortet. Mails richtest
                    du an{" "}
                    <a href="mailto:checkin@hfk-bremen.de">
                        checkin@hfk-bremen.de
                    </a>{" "}
                    <br />
                    <br />
                    Fragen, die hier nicht beantwortet werden, oder Feedback zur
                    Raumbuchung mit Getin richtest du an{" "}
                    <a href="mailto:getin@hfk-bremen.de">
                        getin@hfk-bremen.de
                    </a>{" "}
                    <br />
                    <br />
                    Sonstige Fragen oder Feedback zum Thema Corona und
                    Hochschule an{" "}
                    <a href="mailto:corona@hfk-bremen.de">
                        corona@hfk-bremen.de
                    </a>{" "}
                </FormText>
            </HelpSection>
        </>
    );
};

export default GetinHelpContentDe;
