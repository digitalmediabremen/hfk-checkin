import FullCalendar, { VerboseFormattingArg } from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid"; // a plugin!

import React, { useEffect, useRef, useState } from "react";
import { useTranslation, _t } from "../../localization";
import { AvailableHeight, AvailableHeightProps } from "./AlignContent";
import deLocale from "@fullcalendar/core/locales/de";
import useTheme from "../../src/hooks/useTheme";
import Label from "./Label";
import NewButton from "./NewButton";
import FormGroup from "./FormGroup";
import {
    addDates,
    duration,
    getFormattedDate,
    isToday,
} from "../../src/util/DateTimeUtil";
import { appUrls } from "../../config";
import FormText from "./FormText";
import FormElement from "./FormElement";

const calendarDayFormatter = (date: Date, locale: string) => {

    const weekday = date.toLocaleString(locale, { weekday: "short" });
    const dateString = date.toLocaleDateString(locale, {
        day: "2-digit",
        month: "2-digit",
    });

    if (isToday(date)) return _t(locale, "common", "Heute");

    return `${weekday}, ${dateString}`;
};

const fcDayFormatter = (arg: VerboseFormattingArg) => {
    const locale = arg.localeCodes[0];
    const date = new Date();
    date.setMonth(arg.date.month)
    date.setDate(arg.date.day)
    date.setFullYear(arg.date.year)
    return calendarDayFormatter(date, locale)
}
interface ResourceCalendarProps
    extends Pick<AvailableHeightProps, "noFooter"> {}

const ResourceCalendar: React.FunctionComponent<ResourceCalendarProps> = ({
    noFooter,
}) => {
    const { locale, t } = useTranslation();
    const theme = useTheme();
    const mobile = !useTheme().isDesktop;
    const inset = theme.isDesktop
        ? [0, 0, 0, -5]
        : [0, -theme.spacing(1.5), 0, -theme.spacing(1.5)];
    const calendarRef = useRef<FullCalendar>(null);

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const gotoDate = (amountDays: number) => {
        const api = calendarRef.current?.getApi();
        const newDate = addDates(selectedDate, duration.days(amountDays));
        setSelectedDate(newDate);
        api?.gotoDate(newDate);
        // api?.next();
    };

    

    const currentDateString = calendarDayFormatter(selectedDate, locale)!;

    const daySpan = theme.isDesktop ? 4 : 1;

    return (
        <>
            <style jsx>{`
                color: ${theme.primaryColor};
                --fc-border-color: transparent;
                --fc-today-bg-color: ${theme.secondaryColor};
                --fc-page-bg-color: ${theme.primaryColor};
                --fc-now-indicator-color: ${theme.primaryColor};
                --fc-event-bg-color: transparent;
                --fc-event-border-color: transparent;
                --fc-bg-event-color: ${theme.shadePrimaryColor(1)};
                --fc-bg-event-opacity: 1;
                div {
                    margin: ${inset.map((i) => `${i}px`).join(" ")};
                }

                .fc-timegrid-slot-label-cushion {
                    background: red;
                }
            `}</style>
            <FormGroup sameLine pushRightAfter={1} bottomSpacing={2}>
                {mobile && (
                    <FormElement
                        noPadding
                        noBottomSpacing
                        noOutline
                        density="super-narrow"
                        value={currentDateString}
                    />
                )}
                <NewButton
                    noBottomSpacing
                    noOutline
                    density="super-narrow"
                    onClick={() => gotoDate(-daySpan)}
                >
                    {t("zurück")}
                </NewButton>
                <NewButton
                    noBottomSpacing
                    noOutline
                    density="super-narrow"
                    onClick={() => gotoDate(daySpan)}
                >
                    {t("vor")}
                </NewButton>
            </FormGroup>
            <AvailableHeight noFooter={noFooter}>
                {(height) => (
                    <div>
                        <FullCalendar
                            views={{
                                timeGridFourDay: {
                                    type: "timeGrid",
                                    duration: { days: daySpan },
                                    buttonText: "2 day",
                                },
                            }}
                            ref={calendarRef}
                            allDaySlot={false}
                            locale={locale === "de" ? deLocale : undefined}
                            // dayHeaders={false}
                            dayHeaderFormat={fcDayFormatter}
                            dayHeaderContent={(content) =>
                                mobile ? null : (
                                    <FormText>{content.text}</FormText>
                                )
                            }
                            initialDate={selectedDate}
                            headerToolbar={false}
                            plugins={[timeGridPlugin]}
                            initialView="timeGridFourDay"
                            height={Math.max(height, 300)}
                            slotLabelInterval="02:00"
                            slotDuration="01:00:00"
                            slotLabelContent={(content) => (
                                <span style={{ transform: "translateY(-62%)", display: "inline-block" }}>
                                    <Label>{content.text}</Label>
                                </span>
                            )}
                            // eventContent={() => null}
                            nowIndicator
                            scrollTime="08:00:00"
                            events="https://app.staging.getin.uiuiui.digital/api/space/2c0cd119-7699-407b-8cd0-dcc153ffb57e/availability/"

                            // events={[
                            //     {
                            //         title: "Test",
                            //         start: new Date(
                            //             new Date().getTime() - 1000000
                            //         ),
                            //         end: new Date(
                            //             new Date().getTime() + 10000000
                            //         ),
                            //     },
                            // ]}
                        />
                    </div>
                )}
            </AvailableHeight>
        </>
    );
};

export default ResourceCalendar;
