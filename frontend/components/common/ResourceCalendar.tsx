import deLocale from "@fullcalendar/core/locales/de";
import FullCalendar, {
    CalendarApi,
    EventSourceFunc,
} from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid"; // a plugin!
import React, { useCallback, useEffect, useRef, useState } from "react";
import css from "styled-jsx/css";
import { useTranslation, _t } from "../../localization";
import useTheme from "../../src/hooks/useTheme";
import FullCalendarEventOnResource from "../../src/model/api/FullCalendarEventOnResource";
import Resource from "../../src/model/api/Resource";
import { addDates, duration, isToday } from "../../src/util/DateTimeUtil";
import { insertIf } from "../../src/util/ReservationUtil";
import { getResourceAvailabilityRequestUrl } from "../api/ApiService";
import { AvailableHeight, AvailableHeightProps } from "./AlignContent";
import FormElement from "./FormElement";
import FormGroup from "./FormGroup";
import FormText from "./FormText";
import Label from "./Label";
import NewButton from "./NewButton";

const calendarDayFormatter = (date: Date, locale: string) => {
    const weekday = date.toLocaleString(locale, { weekday: "short" });
    const dateString = date.toLocaleDateString(locale, {
        day: "2-digit",
        month: "2-digit",
    });

    if (isToday(date))
        return (
            <b>
                {_t(locale, "common", "Heute")}, {dateString}
            </b>
        );

    return `${weekday}, ${dateString}`;
};

interface ResourceCalendarProps extends Pick<AvailableHeightProps, "noFooter"> {
    resource: Resource;
    events?: Array<FullCalendarEventOnResource>;
    getTitle?: () => string;
    date?: Date;
}

const {
    className: stripedEventBackground,
    styles: stripedBackgroundStyles,
} = css.resolve`
    :global(.fc .fc-bg-event) {
        // background: none !important;
        background: linear-gradient(
            135deg,
            var(--fc-bg-event-color) 6.25%,
            transparent 6.25%,
            transparent 50%,
            var(--fc-bg-event-color) 50%,
            var(--fc-bg-event-color) 56.25%,
            transparent 56.25%,
            transparent 100%
        );
        background-size: 11.31px 11.31px;
        border: 1px solid var(--fc-bg-event-color);
    }

    :global(.fc-v-event .fc-event-title) {
        overflow: visible;
    }

    :global(td.fc-timegrid-slot.fc-timegrid-slot-lane) {
        border-bottom: 1px solid var(--slot-lane-border-color);
    }
`;

const ResourceCalendar: React.FunctionComponent<ResourceCalendarProps> = ({
    noFooter,
    resource,
    events,
    getTitle,
    date,
}) => {
    const { locale, t } = useTranslation();
    const theme = useTheme();
    const calendarRef = useRef<FullCalendar>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(date || new Date());

    const inset =
        theme.isDesktop && false
            ? [0, 0, 0, -5]
            : [0, -theme.spacing(1.5), 0, -theme.spacing(1.5)];
    const mobile = !useTheme().isDesktop;
    const daySpan = mobile ? 1 : 4;
    const eventUrl = getResourceAvailabilityRequestUrl(resource.uuid);
    const currentDateString = calendarDayFormatter(selectedDate, locale)!;

    useEffect(() => {
        if (!date) return;
        const api = calendarRef.current?.getApi();
        if (!api) return;
        setSelectedDate(date);
    }, [date, calendarRef.current]);

    useEffect(() => {
        if (!selectedDate) return;
        const api = calendarRef.current?.getApi();
        if (!api) return;
        api.gotoDate(selectedDate);
    }, [selectedDate, calendarRef.current]);

    const localEventSource: EventSourceFunc = useCallback(
        (info, succ, fail) => succ(events || []),
        [events]
    );

    const incrementDate = (amountDays: number) => {
        const newDate = addDates(selectedDate, duration.days(amountDays));
        setSelectedDate(newDate);
        // api?.next();
    };

    return (
        <>
            <style jsx>{`
                color: ${theme.primaryColor};
                --fc-border-color: transparent;
                --fc-today-bg-color: ${theme.secondaryColor};
                --fc-page-bg-color: ${theme.primaryColor};
                --fc-now-indicator-color: ${theme.primaryColor};
                --fc-event-text-color: ${theme.secondaryColor};
                --fc-event-bg-color: ${theme.primaryColor};
                --fc-event-border-color: transparent;
                --fc-bg-event-color: ${theme.primaryColor};
                --fc-bg-event-opacity: 1;
                --slot-lane-border-color: ${theme.shadePrimaryColor(0.2)};
                div {
                    margin: ${inset.map((i) => `${i}px`).join(" ")};
                }

                .fc-timegrid-slot-label-cushion {
                    background: red;
                }
            `}</style>
            {stripedBackgroundStyles}

            <FormGroup sameLine pushRightAfter={1} bottomSpacing={2}>
                <FormElement
                    noPadding
                    noBottomSpacing
                    noOutline
                    density="super-narrow"
                    value={[
                        ...insertIf([currentDateString], mobile),
                        ...insertIf([getTitle?.()], !!getTitle),
                    ]}
                />

                <NewButton
                    noBottomSpacing
                    noOutline
                    density="super-narrow"
                    onClick={() => incrementDate(-daySpan)}
                >
                    {t("zurück")}
                </NewButton>
                <NewButton
                    noBottomSpacing
                    noOutline
                    density="super-narrow"
                    onClick={() => incrementDate(daySpan)}
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
                            dayHeaders={!mobile}
                            dayHeaderContent={(content) =>
                                mobile ? null : (
                                    <FormText>
                                        {calendarDayFormatter(
                                            content.date,
                                            locale
                                        )}
                                    </FormText>
                                )
                            }
                            initialDate={selectedDate}
                            headerToolbar={false}
                            plugins={[timeGridPlugin]}
                            initialView="timeGridFourDay"
                            height={Math.max(height, 300)}
                            slotLabelInterval="02:00"
                            slotDuration="01:00:00"
                            viewClassNames={stripedEventBackground}
                            slotLabelContent={(content) => (
                                <span
                                    style={{
                                        transform: "translateY(-62%)",
                                        display: "inline-block",
                                    }}
                                >
                                    <Label>{content.text}</Label>
                                </span>
                            )}
                            // eventContent={() => null}
                            nowIndicator
                            // eventColor={theme.primaryColor}
                            // eventTextColor={theme.secondaryColor}
                            scrollTime="08:00:00"
                            eventSources={[eventUrl, localEventSource]}
                        />
                    </div>
                )}
            </AvailableHeight>
        </>
    );
};

export default ResourceCalendar;
