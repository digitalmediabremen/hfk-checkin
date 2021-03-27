import { Translation } from ".";

const translation: Translation = {
    en: {
        common: {
            "nicht verifiziert": "not verified",
            "Mist. Da ist was schiefgelaufen.": "Hmm. Something went wrong.",
            "Melde dich bei": "Report to",
            "wenn dieser Fehler häufiger auftritt.": "if this error repeats.",
            "Seite nicht gefunden": "Page not found",
            "+{days} Tag": "+{days} day",
            jetzt: "now",
            "Raum übernehmen": "Reuse room",
            "Zeit übernehmen": "Reuse time",
            "Wähle die Angaben aus, die du aus der Buchung #{identifier} übernehmen möchtest.":
                "Select information to reuse from booking #{identifier}.",
            Hilfe: "Help",
            "Du bist offline": "You are officially offline.",
            Datenschutzinformationen: "Data privacy",
            Protokoll: "Log",
            "Noch keine Checkins vorhanden": "No checkins so far",
            "Telefon ändern": "change phone number",
            "sowie {fields}": "and also {fields}",
            Heute: "Today",
            Morgen: "Tomorrow",
            Datenschutz: "Privacy",
            Ausloggen: "Logout",
        },
        reservation: {
            "Es gibt keine bevorstehenden Buchungen.": "No upcoming bookings.",
            "Vergangene ausblenden": "Hide past bookings",
            "Vergangene einblenden": "Show past bookings",
            Buchungsübersicht: "Bookings",
            "Telefon ändern": "Change phone",
            "Bist du sicher, dass du deine Buchung stornieren willst? Diese Aktion lässt sich nicht rückgängig machen.":
                "Are you sure to cancel your booking? This action cannot be reversed.",
            "Deine Buchung {identifier} wurde storniert.":
                "Your booking request {identifier} has been canceled.",
            "aus Anfrage übernehmen": "Additional from copy",
            "Deine Anfrage ist eingegangen.":
                "Your booking request has been received.",
            Stornieren: "Cancel",
            "Anfrage kopieren": "Copy request",
            angefragt: "requested",
            bestätigt: "confirmed",
            abgelehnt: "denied",
            storniert: "canceled",
            erstellt: "created",
        },
        request: {
            Teilnehmerinnen: "Attendees",
            Teilnehmer: "Attendees",
            Buchungsgrund: "Purpose",
            Nachricht: "Message",
            "Datum und Uhrzeit": "Date and time",
            Raum: "Room",
            "Externe Personen": "Attendees",
            "Person hinzufügen": "Add person",
            Raumliste: "Rooms",
            "Neue Anfrage": "New booking request",
            Zeit: "time",
            "optionale angaben": "optional information",
            "Pers.": "Pers.",
            Grund: "Purpose",
            "Nach.": "Msg.",
            "Meine Telefonnummer ({phone}) darf für Rückfragen verwendet werden.":
                "I allow my phone number ({phone}) to be used for queries.",
            Anfragen: "request",
            Telefonkontakt: "Phone contact",
            Alleinnutzung: "Exclusive use",
            Anfang: "Begin",
            Ende: "End",
            "Weitere Personen": "Additional participants",
            'Du hast keine Berechtigung den Raum "{resource}" zu buchen.':
                'You don\'t have permission to book this room "{resource}".',
            "Ein Ausnahmegrund muss angegeben werden.":
                "Please specify an exception.",
            "Du musst noch den Raum auswählen.": "Please select a room.",
            "Du musst noch eine Zeit angeben.": "Please select date and time.",
        },
        "request-resource-list": {
            Zugang: "Access",
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
            "Aufenthaltsgrund angeben": "State purpose now",
        },
        "request-attendee-set": {
            "{fieldName} darf nicht leer sein.": "{fieldName} cannot be empty",
            Vorname: "First name",
            Nachname: "Surname",
            Telefonnummer: "Phone number",
            "Keine gültige Telefonnummer": "Not a valid phone number",
            "Die Telefonnummer wird auschliesslich im Falle einer  Infektionsnachverfolgung verwendet.":
                "Your phone number is only used in case of infection.",
            Hinzufügen: "Add",
        },
        "request-resource": {
            "Gebäude auswählen": "select building",
            "Raum suchen": "search room",
            "Name oder Nummer eingeben...": "Enter room name or number...",
            "Keine Ergebnisse": "no results",
            "Aus Liste wählen": "select from list",
            "Wenn du dies für einen Fehler hälst, solltest du im Kommentar der Buchung deine Situation schildern.":
                "If you think this is a mistake, please describe your situation in the message box.",
            "Kommentar hinzufügen": "add message",
            "Ich möchte den Raum allein nutzen.":
                "I want to use the room alone.",
            'Jeder Raum muss einzeln angefragt werden. Wenn du mehrere Räume für den gleichen Zeitraum anfragen möchtest, klicke nach dem Absenden dieser Anfrage auf "Anfrage kopieren"':
                'Rooms can\’t be booked over continuous dates. If you want to request the same booking over a number of days, you may transfer the information from your previous booking under "Copy request".',
        },
        "request-message": {
            "message-placeholder":
                "Please explain you request if needed. \n\nFor example you can add relevant information for workshop leaders or teh room-booking-team.",
        },
        "request-purpose": {
            "Bitte ergänze deine Anfrage mit folgender Information.":
                "Please complete your request with the following information.",
            Begründung: "Please explain what you are planning to do.",
            "Normale Buchung": "Regular booking",
            Prüfung: "Exam",
            Prüfungsvorbereitung: "Exam preparation",
            Abholung: "Pick-up",
            Gremiensitzung: "Board meeting",
            "Anderer Grund": "Other",
            Extern: "External",
            weitere: "other",
        },
        "request-time": {
            Datum: "Date",
            Von: "Start",
            Bis: "End",
            "Bitte wähle ein frühreres Datum aus oder gib einen Buchungsgrund an.":
                "Please select an earlier date or specify the purpose of your booking request.",
            "Buchungsgrund angeben": "State booking purpose",
            "Bitte rechne mit einer Bearbeitungszeit von mind. 48 Stunden.":
                "Please allow at least 48 hours for processing.",
            "Wichtig: Am Wochenende werden in der Regel keine Anfragen bearbeitet. Willst du also eine Werkstatt für Montag um 10 Uhr buchen, stelle deine Anfrage bis spätestens Donnerstag 10 Uhr.":
                "Important: Requests are not processed on weekends. If you want to book a workshop on Monday at 10 a.m., you should submit your request by Thursday at 10 a.m. at the latest.",
            'Der Raum "{resource}" kann maximal {days} Tage im Voraus gebucht werden.':
                'Room "{resource}" can only be booked {days} days in advance.',
            "Räume können maximal {days} Tage im Vorraus gebucht werden.":
                "Rooms can only be booked {days} days in advance.",
        },
        cookieError: {
            "Es gibt ein Cookie Problem.":
                "We have an issue with your cookie settings.",
            "Mögliche Fehlerquellen:": "Possible issues:",
            "Du benutzt den Incognito-Modus deines Browsers:":
                "You are using incognito mode:",
            "Aktuell unterstützt {appname} diesen nicht.":
                "{appname} does not support incognito mode.",
            "Du hast Cookies in deinen Browsereinstellung deaktiviert:":
                "You deactivated cookies in your browser settings:",
            "Du musst Cookies zulassen um {appname} nutzen zu können.":
                "You need to allow cookies to use {appname}.",
            "Melde dich bei": "Report to",
            "wenn dieser Fehler häufiger auftritt.":
                "if this error occurs regularly.",
        },
        createProfile: {
            Anmelden: "Sign in",
            "Die konsequente Einhaltung des HfK-Hygienekonzepts ist die Voraussetzung für künftige Öffnungsschritte der HfK.":
                "Our University will only make progress in a gradual reopening, if we all strictly follow the HfK hygiene rules.",
            "please-use-checkin":
                "Please do use Checkin to document your stay, as only the digital system enables our staff member tasked with handling issues relating to the pandemic, the Corona-Beauftragte, to inform you quickly if an infection risk arises in your close environ-ment.",
            "Aktuell ist die Nutzung von Getin nur mit einem HfK-Account möglich.":
                "Until now Getin is only accessible with an HfK-account",
            "HfK-Angehörige": "HfK members",
            Gäste: "guests",
            "Die Verifizierung mit Identitätsnachweis ist nach der Registrierung notwendig.":
                "The verification with a photo ID at the front desk after registration is mandatory",
            Gastzugang: "guest access",
            "Buchungen können erst mit einem Startzeitpunkt beginnend ab dem 06.04.2021 - 08:00 getätigt werden.": "Booking request can be made with a starting date beginning of 04/06/2021 - 8am."
        },
        setprofile: {
            "{fieldName} darf nicht leer sein.": "{fieldName} can't be empty.",
            "Profil erstellen": "Create profile",
            "Profil ändern": "Change profile",
            Vorname: "First name",
            Nachname: "Surname",
            Telefonnummer: "Phone number",
            "Keine gültige Telefonnummer": "Not a valid phone number",
            "setprofile-accept-legal":
                "Your data will only be used, if an infection occurs. With your registration you agree to the prevailing privacy policy that your data is being collected for tracing purposes in the event of an infection. You confirm to have read and understood the HfK rules of hygiene and to follow these rules during the stay at the HfK Bremen. Please find our prevailing privacy policy and the HfK hygiene rules on faq.hfk-bremen.de or on https://www.hfk-bremen.de/corona-downloads and on display at the front desk.",
            "Die Telefonnummer wird auschliesslich im Falle einer Infektionsnachverfolgung verwendet.":
                "Your phone number is only used in case of an infection.",
            Erstellen: "Create",
            Speichern: "Save",
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
