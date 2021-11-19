import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid"; // a plugin!

import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "../../localization";
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

    const currentDateString = isToday(selectedDate)
        ? t("Heute")
        : getFormattedDate(selectedDate, locale)!;

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
                    onClick={() => gotoDate(-1)}
                >
                    {t("zurück")}
                </NewButton>
                <NewButton
                    noBottomSpacing
                    noOutline
                    density="super-narrow"
                    onClick={() => gotoDate(1)}
                >
                    {t("vor")}
                </NewButton>
            </FormGroup>
            <AvailableHeight noFooter={noFooter}>
                {(cssAvailableHeight) => (
                    <div>
                        <FullCalendar
                            views={{
                                timeGridFourDay: {
                                    type: "timeGrid",
                                    duration: { days: theme.isDesktop ? 4 : 1 },
                                    buttonText: "2 day",
                                },
                            }}
                            ref={calendarRef}
                            allDaySlot={false}
                            locale={locale === "de" ? deLocale : undefined}
                            // dayHeaders={false}
                            dayHeaderContent={(content) =>
                                mobile ? null : (
                                    <FormText>{content.text}</FormText>
                                )
                            }
                            initialDate={selectedDate}
                            headerToolbar={false}
                            plugins={[timeGridPlugin]}
                            initialView="timeGridFourDay"
                            height={cssAvailableHeight}
                            slotLabelInterval="02:00"
                            slotDuration="01:00:00"
                            slotLabelContent={(content) => (
                                <Label>{content.text}</Label>
                            )}
                            // eventContent={() => null}
                            nowIndicator
                            scrollTime="08:00:00"
                            eventSources={[
                                "https://app.staging.getin.uiuiui.digital/api/space/2c0cd119-7699-407b-8cd0-dcc153ffb57e/availability/",
                            ]}
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
