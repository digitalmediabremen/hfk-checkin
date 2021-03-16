import { Translation } from ".";

const translation: Translation = {
    en: {
        common: {
            "nicht verifiziert": "not verified",
            "Seite nicht gefunden": "Page not found",
            "Mist. Da ist was schiefgelaufen.": "Hmm. Something went wrong.",
            "Melde dich bei": "Report to",
            "wenn dieser Fehler häufiger auftritt.": "if this error repeats.",
            "+{days} Tag": "+{days} days",
            jetzt: "now",
            "{fieldName} darf nicht leer sein.": "{fieldName} cannot be empty",
            Vorname: "First name",
            Nachname: "Surname",
            Telefonnummer: "Phone number",
            "Die Telefonnummer wird auschliesslich im Falle einer  Infektionsnachverfolgung verwendet.":
                "The phone number will only be used, if an infection occurs.",
            "Raum übernehmen": "Reuse room",
            "Zeit übernehmen": "Reuse time",
            "Neue Anfrage": "New booking request",
            Hilfe: "Help",
            "Du bist offline": "You are officially offline.",
            Datenschutzinformationen: "Data privacy",
            Protokoll: "Log",
            "Noch keine Checkins vorhanden": "No checkins so far",
            "Telefon ändern": "change phone number",
            Heute: "today",
            Morgen: "tomorrow",
        },
        reservation: {
            "Noch hast du keine Buchungsanfragen gestellt.":
                "You haven't made any booking requests yet.",
            "Neue Buchungsanfrage": "New booking request",
            Buchungen: "Bookings",
            "Telefon ändern": "Change phone",
            "Bist du sicher, dass du deine Buchung stornieren willst? Diese Aktion lässt sich nicht rückgängig machen.":
                "Are you sure to cancel your booking? This action cannot be reversed.",
            "'Deine Buchung {identifier} wurde storniert.'":
                "Your booking request {identifier} has been cancelled.",
            "Weitere Anfrage": "Additional request",
            "Deine Anfrage ist eingegangen.":
                "Your booking request has been received.",
            Stornieren: "Cancel",
            "weitere Anfrage": "More booking requests",
            angefragt: "requested",
            bestätigt: "confirmed",
            abgelehnt: "denied",
            storniert: "cancelled",
            erstellt: "created",
        },
        request: {
            "Externe Personen": "External person",
            "Teilnehmer": "Attendees",
            "Teilnehmerinnen": "Attendees",
            Buchungsgrund: "Purpose",
            Nachricht: "Message",
            "Datum und Uhrzeit": "Date and time",
            Raum: "Room",
            "Person hinzufügen": "Add person",
            Raumliste: "Rooms",
            "Neue Anfrage": "New booking request",
            Zeit: "time",
            "optionale angaben": "optional information",
            "Pers.": "Pers.",
            Grund: "Purpose",
            "Nach.": "Msg.",
            "Meine Telefonnummer ({phone}) darf für Rückfragen verwendet werden.":
                "My phone number ({phone}) may be used for queries.",
            Anfragen: "request",
            Telefonkontakt: "Phone contact",
            Alleinnutzung: "Exclusive use",
            Anfang: "Begin",
            Ende: "End",
            "Ein Ausnahmegrund muss angegeben werden.":
                "Please specify an exception.",
            "Du musst noch den Raum auswählen.": "Please select a room.",
            "Du musst noch eine Zeit angeben.": "Please select date and time.",
            "Weitere Personen": "Additional participants",
            "Du hast keine Berechtigung den Raum \\{resource}\\ zu buchen.":
                'You don\'t have permission to book this room "{resource}".',
        },
        "request-attendees": {
            "HfK externe Person(en) anmelden": "Register external person(s)",
            Delete: "Delete",
            "Person hinzufügen": "Add person",
            "Weitere Person hinzufügen": "Additional person",
            "HfK externe Personen müssen vorab angemeldet werden. Deine Anfrage wird an die Corona-Beauftragte geschickt und geprüft. Dieser Vorgang kann deine Raumanfrage verzögern.":
                "Visits of external persons - non-HfK-members - must be coordinated in advance. Your request will be sent to our staff member tasked with handling issues relating to the pandemic, the Corona-Beauftragte, for review. This process may delay your room request.",
            "Bitte nenne den Grund des Aufenthaltes der o.g. Person/en.":
                "Please state the purpose of the person's stay.",
            "Aufenthaltsgrund angeben": "state purpose of stay.",
        },
        "request-resource": {
            "Gebäude auswählen": "select building",
            "Raum suchen": "search room",
            "Name oder Nummer eingeben...": "enter room or room number...",
            "Keine Ergebnisse": "no results",
            "Aus Liste wählen": "select from list",
            "Wenn du dies für einen Fehler hälst, solltest du im Kommentar der Buchung deine Situation schildern.":
                "If you think this is a mistake, please describe your situation in the message box.",
            "Kommentar hinzufügen": "add message",
            "Ich möchte den Raum allein nutzen.":
                "I want to use the room alone.",
        },
        "request-message": {
            "Bitte erläutere Deine Anfrage nach Bedarf. \\n\\nZum Beispiel kannst Du hier Angaben für die Werkstattleitung machen oder dem Raumteam wichtige Informationen übermitteln.":
                "Please explain you request if needed. \\n\\nFor example you can add relevant information for workshop leaders or teh room-booking-team.",
        },
        "request-purpose": {
            "Bitte ergänze deine Anfrage mit folgender Information.":
                "Please complete your request with the following information.",
            Begründung: "reason",
            "Normale Buchung": "regular booking",
            "Prüfung bzw. Prüfungsvorbereitung":
                "exam and/or preparation for an exam",
            Abholung: "pick-up",
            Gremiensitzung: "board meeting",
            "Anderer Grund": "other reasen",
            Extern: "external",
            weitere: "other",
        },
        "request-time": {
            "Bitte wähle ein frühreres Datum aus oder gib einen Buchungsgrund an.":
                "Please select an earlier date or specify a reason for your booking request.",
            "Buchungsgrund angeben": "specify reason for booking request",
            "Bitte rechne mit einer Bearbeitungszeit von mind. 48 Stunden.":
                "Please allow at least 48 hours for processing.",
            "Wichtig: Am Wochenende werden in der Regel keine Anfragen bearbeitet. Willst du also eine Werkstatt für Montag um 10 Uhr buchen, stelle deine Anfrage bis spätestens Donnerstag 10 Uhr.":
                "Important: Requests are not processed on weekends. If you want to book a workshop for Monday at 10 a.m., you should submit your request by Thursday at 10 a.m. at the latest.",
            "Der Raum \\{resource}\\ kann maximal {days} Tage im Voraus gebucht werden.":
                "Room \\{resource}\\ can only be booked {days} days in advance.",
            "Räume können maximal {days} Tage im Vorraus gebucht werden.":
                "Rooms can only be booked {days} days in advance.",
            Datum: "Date",
            Von: "Begin",
            Bis: "End",
        },
        createProfile: {
            "Die konsequente Einhaltung des HfK-Hygienekonzepts ist die Voraussetzung für künftige Öffnungsschritte der HfK.":
                "Our University will only make progress in a gradual reopening, if we all strictly follow the HfK hygiene rules.",
            "please-use-checkin":
                "Please do use Checkin to document your stay, as only the digital system enables our staff member tasked with handling issues relating to the pandemic, the Corona-Beauftragte, to inform you quickly if an infection risk arises in your close environ-ment.",
            "HfK-Angehörige": "HfK members",
            Gäste: "guests",
            "Die Verifizierung mit Identitätsnachweis ist nach der Registrierung notwendig":
                "The verification with a photo ID at the front desk after registration is mandatory",
            Gastzugang: "guest access",
        },
        setprofile: {
            erforderlich: "required",
            Vorname: "first name",
            Nachname: "surname",
            Telefonnummer: "phone number",
            "setprofile-accept-legal":
                "Your data will only be used, if an infection occurs. With your registration you agree to the prevailing privacy policy that your data is being collected for tracing purposes in the event of an infection. You confirm to have read and understood the HfK rules of hygiene and to follow these rules during the stay at the HfK Bremen. Please find our prevailing privacy policy and the HfK hygiene rules on faq.hfk-bremen.de or on https://www.hfk-bremen.de/corona-downloads and on display at the front desk.",
            Registrieren: "register",
            Speichern: "save",
        },
        verifyNow: {
            Identitätsprüfung: "Identity check",
            "Bitte zeige diese Angaben dem Personal am Empfang.":
                "Please show this information at the front desk.",
            "Sobald die Angaben durch das Personal geprüft und ihrerseits gespeichert wurden, kann der Prozess abgeschlossen werden.":
                "Once your ID has been checked by the staff at the front desk, the verification process is completed.",
            Abschliessen: "close",
        },
        verifyProfile: {
            Identitätsprüfung: "Identity check",
            "Per Verordnung ist die HfK verpflichtet, den Zugang zu den Gebäuden zu kontrollieren, um das Infektionsrisiko zu minimieren.":
                "In an effort to keep exposure to infections as low as possible, our University is bound by government rules to control access to our facilities. ",
            "Bitte zeigen Sie jetzt einen Identitätsnachweis (Lichtbildausweis) am Empfang vor":
                "Please present your photo ID at the front desk.",
            "Bevor ihre Identität nicht verifiziert ist, ist die Protokollierung und ein Eintritt nicht möglich.":
                "Entering our facilities is not possible, until your identity has been verified.",
            Erledigt: "done",
        },
        checkin: {
            "Erfolgreich ausgecheckt": "check-out successful",
            "Personen aktuell eingecheckt": "persons currently checked-in",
            Auschecken: "Check-out",
            "Du bist noch an folgenden Orten eingecheckt:":
                "You're checked-in at the following locations:",
            "Du bist bereits eingecheckt": "You are already checked-in",
            "Checkin erfolgreich": "Check-in successful",
        },
        enterCode: {
            "Checkin / Checkout": "Checkin / Checkout",
            "Bitte gib die 4-stellige Nummer des Standortes ein, den du jetzt betrittst oder verlässt.":
                "Please enter the four-digit code of the location you want to exit or enter.",
            "oder nutze den QR-Codes des Standorts um deinen Aufenthalt zu dokumentieren.":
                "or scan the QR code of your location.",
            Einchecken: "Check-in",
        },
    },
};
export default translation;
