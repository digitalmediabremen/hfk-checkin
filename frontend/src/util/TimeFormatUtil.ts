import { start } from "repl";
import { _t } from "../../localization";
import reservation from "../../pages/reservation";
import {
    addDates,
    createDateNow,
    createTime,
    duration,
    fromTime,
    getFormattedDate,
    isToday,
    isTomorrow,
    smallerThan,
    Time,
    TimeString,
} from "./DateTimeUtil";

export function time(time: Date): TimeString {
    function pad(number: number) {
        if (number < 10) {
            return "0" + number;
        }
        return number;
    }
    return `${pad(time.getHours())}:${pad(time.getMinutes())}` as TimeString;
}

export function timeSpan(from: Date, to: Date) {
    const overlap = smallerThan(
        createTime(to.getHours(), to.getMinutes()),
        createTime(from.getHours(), from.getMinutes())
    );
    return `${time(from)} — ${time(to)} ${overlap ? "(+1 Tag)" : ""}`;
}

export function date(date: Date, locale: string) {
    const weekday = date.toLocaleString(locale, { weekday: "short" });
    const dateString = date.toLocaleDateString(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

    return `${weekday}, ${dateString}`;
}

export function dateRelative(_date: Date, locale: string) {
    if (isToday(_date)) return _t(locale, "common", "Heute");
    if (isTomorrow(_date)) return _t(locale, "common", "Morgen");
    return date(_date, locale);
}
