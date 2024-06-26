import { empty } from "./TypeUtil";

export type TimeString = `${number}${number}:${number}${number}`;

export type Time = Date & { isTime: true };

const ONE_DAY_INTERVAL = 1000 * 60 * 60 * 24;
const ONE_HOUR_INTERVAL = 1000 * 60 * 60;

export function assertTime(time: Time) {
    if (empty(time.isTime) && time.isTime === false)
        throw `Not a time instance provided.`;
    if (time.getTime() >= ONE_DAY_INTERVAL)
        throw `Time exceeds range of one day`;
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
};

export const smallerThan = (
    value: Time | Date,
    valueToCompareTo: Time | Date
): boolean => {
    return value.getTime() <= valueToCompareTo.getTime();
};

export const createTime = (hours: number, minutes: number): Time => {
    // set zero date
    const d = new Date(0) as Time;

    // only allow steps of 5 minutes
    const expected = minutes + ((60 - minutes) % 10);
    const minutesBoxed = expected % 60;
    const hoursBoxed = expected >= 60 ? hours + 1 : hours;
    d["isTime"] = true;
    d.setHours(hours, minutes, 0);
    if (isNaN(d.getTime())) throw "time not valid";
    return d;
};

const timeWithinDateIsConsideredNow = 1;

export const isNow = (
    date: Date,
    thresholdInMinutes: number = timeWithinDateIsConsideredNow
) =>
    Math.abs(new Date().getTime() - date.getTime()) <
    thresholdInMinutes * 60 * 1000;

export const isToday = (date: Date) =>
    new Date().toDateString() === date.toDateString();

export const isTomorrow = (date: Date) =>
    addDates(new Date(), duration.days(1)).toDateString() ===
    date.toDateString();

export const createTimeNow = (): Time => {
    const now = new Date();
    const d = createTime(now.getHours(), now.getMinutes());
    return d;
};

export const createDefaultTime = (): Time => {
    const now = new Date();
    const d = createTime(now.getHours(), 0);
    return d;
};

export const createTimeFromDate = (v: Date): Time => {
    const d = createTime(v.getHours(), v.getMinutes());
    return d;
};

export const timeFromDateOrNow = (d?: Date): Time => {
    if (empty(d)) return createTimeNow();
    return createTime(d?.getHours(), d?.getMinutes());
};

export const fromTime = (time: Time | Date): TimeString => {
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

export const addDates = (value: Date, valueToAdd: Date) => {
    return createDate(
        value.getTime() +
            valueToAdd.getTime() -
            valueToAdd.getTimezoneOffset() * 60 * 1000
    );
};

export const addDateTime = (value: Date, valueToAdd: Date) => {
    return createDatetime(
        value.getTime() +
            valueToAdd.getTime() -
            valueToAdd.getTimezoneOffset() * 60 * 1000
    );
};

export const mergeDateAndTime = (date: Date, time: Date | Time) => {
    const d = new Date();
    d.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    d.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), 0);
    return d;
};

export const createDateNow = () => {
    return createDate(new Date().getTime());
};

export const duration = {
    days: (days: number): Date => {
        return createDate(ONE_DAY_INTERVAL * days);
    },
    hours: (hours: number): Date => {
        return createDatetime(ONE_HOUR_INTERVAL * hours);
    },
};

export type DateString =
    `${number}${number}-${number}${number}-${number}${number}`;

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

export const createDate = (datetime?: number): Date => {
    if (empty(datetime)) return createDateNow();
    const d = new Date(datetime);
    d.setHours(0, 0, 0, 0);

    return d;
};

export const createDatetime = (datetime: number): Date => {
    const d = new Date(datetime);
    return d;
};

export const fromDateString = (dateString: DateString): Date => {
    const timestamp = Date.parse(dateString.replace(/-/g, "/"));
    if (isNaN(timestamp)) throw `DateString in wrong format`;
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date;
};

export const getDateString = (date: Date): DateString => {
    function pad(number: number) {
        if (number < 10) {
            return "0" + number;
        }
        return number;
    }
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate()
    )}` as DateString;
};
