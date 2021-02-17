import { createDeflate } from "zlib";
import { empty, notEmpty } from "./TypeUtil";

export type TimeString = `${number}${number}:${number}${number}`;

export type Time = Date & { isTime: true };

const ONE_DAY_INTERVAL = 1000 * 60 * 60 * 24;


export function assertTime(time: Time) {
    if (empty(time.isTime) && time.isTime === false) throw `Not a time instance provided.`
    if (time.getTime() >= ONE_DAY_INTERVAL) throw `Time exceeds range of one day`
}

export function assertTimeString(
    timeString: string
): asserts timeString is TimeString {
    const [hours, minutes] = timeString.split(":");
    if (
        empty(minutes) ||
        empty(hours) ||
        minutes.length !== 2 ||
        hours.length !== 2
    )
        throw `Invalid format in timestring "${timeString}" supplied.`;
    if (
        parseInt(minutes) < 0 ||
        parseInt(minutes) > 59 ||
        parseInt(hours) < 0 ||
        parseInt(hours) > 23
    )
        throw `Invalid time in timestring "${timeString}"`;

    return;
}

export const timeFromTimeString = (timeString: TimeString): Time => {
    const [minutes, hours] = timeString.split(":");
    return createTime(parseInt(minutes), parseInt(hours));
};

export const hasOverlap = (time: Time): boolean => {
    assertTime(time);
    return time.getTime() > ONE_DAY_INTERVAL;
}

export const smallerThan = (value: Time | Date, valueToCompareTo: Time | Date): boolean => {
    return value.getTime() <= valueToCompareTo.getTime();
}

export const createTime = (hours: number, minutes: number): Time => {
    // set zero date
    const d = new Date(0) as Time;
    d["isTime"] = true;
    d.setHours(hours, minutes, 0);
    if (isNaN(d.getTime())) throw "time not valid";
    return d;
};

export const createTimeNow = (): Time => {
    const now = new Date();
    const d = createTime(now.getHours(), now.getMinutes());
    return d;
};

export const fromTime = (time: Time): TimeString => {
    assertTime(time);
    function pad(number: number) {
        if (number < 10) {
            return "0" + number;
        }
        return number;
    }
    return `${pad(time.getHours())}:${pad(time.getMinutes())}` as TimeString;
};

// date util
export const getFormattedDate = (date: Date | undefined, locale: string) => {
    if (!date) return undefined;

    const weekday = date.toLocaleString(locale, { weekday: "short" });
    const dateString = date.toLocaleDateString(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

    return `${weekday}, ${dateString}`;
};

export const minDate = (date: Date, dateToCompare: Date) => {
    if (date.getTime() > dateToCompare.getTime()) return dateToCompare;
    return date;
};

export const maxDate = (date: Date, dateToCompare: Date) => {
    if (date.getTime() < dateToCompare.getTime()) return dateToCompare;
    return date;
};

export type DateString = `${number}${number}-${number}${number}-${number}${number}`;

export function assertDateString(
    dateString: string
): asserts dateString is DateString {
    const [year, month, day] = dateString.split("-");

    if (
        empty(year) ||
        empty(month) ||
        empty(day) ||
        year.length !== 4 ||
        month.length !== 2 ||
        day.length !== 2
    )
        throw `DateString "${dateString}" has wrong format`;

    if (
        parseInt(month) < 1 ||
        parseInt(month) > 12 ||
        parseInt(day) < 1 ||
        parseInt(day) > 31
    )
        throw `DateString "${dateString}" exceeds value range.`;
}

export const fromDateString = (dateString: DateString): Date => {
    const timestamp = Date.parse(dateString);
    if (isNaN(timestamp)) throw `DateString in wrong format`

    return new Date(dateString);
}

export const getDateString = (date: Date): DateString => {
    function pad(number: number) {
        if (number < 10) {
            return "0" + number;
        }
        return number;
    }
    return `
        ${date.getUTCFullYear()}-
        ${pad(date.getUTCMonth() + 1)}-
        ${pad(date.getUTCDay())}
    ` as DateString;
};
