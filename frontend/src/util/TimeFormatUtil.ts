import { start } from "repl";
import { createTime, fromTime, getFormattedDate, smallerThan, Time, TimeString } from "./DateTimeUtil";

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