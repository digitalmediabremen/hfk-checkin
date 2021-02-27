import { useTranslation } from "../../localization";
import { ReservationPurpose } from "../model/api/Reservation";
import { assertDateString } from "../util/DateTimeUtil";
import { assertNever } from "../util/TypeUtil";

export default function useReservationPurposeText() {
    const { t } = useTranslation();

    return (key?: ReservationPurpose) => {
        if (key === undefined) 
            return t("Normale Buchung");
        if (key === "COUNCIL_MEETING")
            return t("Ich buche für eine Gremiensitzung");
        if (key === "EXAM")
            return t("Ich buche für eine Prüfung");
        if (key === "OTHER")
            return t("Anderer Grund");
        if (key === "WORKSHOP_USAGE")
            return t("Workshop Buchung");
       assertNever(key, "sdfs");
    };
}
