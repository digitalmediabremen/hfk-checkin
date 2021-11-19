import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid"; // a plugin!

import React, { useEffect, useState } from "react";
import { useTranslation } from "../../localization";
import { AvailableHeight, AvailableHeightProps } from "./AlignContent";
import deLocale from "@fullcalendar/core/locales/de";
import useTheme from "../../src/hooks/useTheme";
import Label from "./Label";

interface ResourceCalendarProps
    extends Pick<AvailableHeightProps, "noFooter"> {}

const ResourceCalendar: React.FunctionComponent<ResourceCalendarProps> = ({
    noFooter,
}) => {
    const { locale } = useTranslation();
    const theme = useTheme();
    const inset = theme.isDesktop
        ? [0, 0, 0, -5]
        : [0, -theme.spacing(1.5), 0, -theme.spacing(1.5)];
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

                div {
                    margin: ${inset.map((i) => `${i}px`).join(" ")};
                }

                .fc-timegrid-slot-label-cushion {
                    background: red;
                }
            `}</style>
            <AvailableHeight noFooter={noFooter}>
                {(cssAvailableHeight) => (
                    <div>
                        <FullCalendar
                            allDaySlot={false}
                            locale={locale === "de" ? deLocale : undefined}
                            dayHeaders={false}
                            headerToolbar={false}
                            plugins={[timeGridPlugin]}
                            initialView="timeGridDay"
                            height={cssAvailableHeight}
                            slotLabelContent={(content) => (
                                <Label>{content.text}</Label>
                            )}
                            eventContent={() => null}
                            nowIndicator
                            scrollTime="08:00:00"
                            events={[
                                {
                                    title: "Test",
                                    start: new Date(
                                        new Date().getTime() - 1000000
                                    ),
                                    end: new Date(
                                        new Date().getTime() + 10000000
                                    ),
                                },
                            ]}
                        />
                    </div>
                )}
            </AvailableHeight>
        </>
    );
};

export default ResourceCalendar;
