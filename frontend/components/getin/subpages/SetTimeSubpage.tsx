import React, { useEffect, useState } from "react";
import SmoothCollapse from "react-smooth-collapse";
import { useTranslation } from "../../../localization";
import useReservationState from "../../../src/hooks/useReservation";
import {
    addDates,
    addDateTime,
    createDate,
    createDateNow,
    createTime,
    createTimeNow,
    duration,
    mergeDateAndTime,
    smallerThan,
    Time,
    timeFromDateOrNow,
} from "../../../src/util/DateTimeUtil";
import { empty, notEmpty } from "../../../src/util/TypeUtil";
import { useAppState } from "../../common/AppStateProvider";
import Fade from "../../common/Fade";
import FormDateInput from "../../common/FormDateInput";
import FormElement from "../../common/FormElement";
import FormTimeInput from "../../common/FormTimeInput";
import Notice from "../../common/Notice";

interface SetTimeSubpageProps {}

const SetTimeSubpage: React.FunctionComponent<SetTimeSubpageProps> = ({}) => {
    const { appState, dispatch } = useAppState();

    const { reservation } = appState;
    const { start: datetimeFrom, end: datetimeTo } = reservation || {};

    const [date, setDate] = useState<Date | undefined>(
        createDate(datetimeFrom?.getTime())
    );
    const [timeFrom, setTimeFrom] = useState<Time | undefined>(
        timeFromDateOrNow(datetimeFrom)
    );
    const [timeTo, setTimeTo] = useState<Time | undefined>(
        timeFromDateOrNow(datetimeTo)
    );
    const { t } = useTranslation();

    const hasOverlap =
        notEmpty(timeFrom) && notEmpty(timeTo) && smallerThan(timeTo, timeFrom);

    useEffect(() => {
        if (empty(date)) return;
        (async () => {
            if (notEmpty(timeFrom) && notEmpty(timeTo)) {
                const _datetimeFrom = mergeDateAndTime(date, timeFrom);
                let _datetimeTo = mergeDateAndTime(date, timeTo);
                if (hasOverlap) {
                    _datetimeTo = addDateTime(_datetimeTo, duration.days(1));
                }
                dispatch({
                    type: "updateReservation",
                    reservation: {
                        ...reservation,
                        start: _datetimeFrom,
                        end: _datetimeTo,
                    },
                });
            }
        })();
    }, [date, timeFrom, timeTo, hasOverlap]);

    const exceedsBookableRange = appState.reservationValidation.some(
        (v) => v.type === "exceedsBookableRange"
    );
    return (
        <>
            <style jsx>{``}</style>

            <FormDateInput
                label="Datum"
                value={date}
                onChange={setDate}
                bottomSpacing={2}
                minValue={createDateNow()}
                extendedWidth
            />
            <FormTimeInput
                label="Von"
                value={timeFrom}
                onChange={setTimeFrom}
                bottomSpacing={1}
                extendedWidth
            />
            <FormTimeInput
                label="Bis"
                value={timeTo}
                onChange={setTimeTo}
                bottomSpacing={4}
                hasOverlap={hasOverlap}
                extendedWidth
            />

            <SmoothCollapse expanded={exceedsBookableRange}>
                <Notice
                    error
                    title={t(
                        "Räume können nur mit einer Vorlaufzeit von max. 14 Tagen gebucht werden."
                    )}
                >
                    {t(
                        "Bitte wähle ein anderes Datum aus oder gib eine Ausnahmeregelung an."
                    )}
                </Notice>
                <FormElement
                    // {...handlerProps("grund")}
                    value={[
                        "erste Zeile die auch sehr lang ist und nervt.",
                        "zweite Zeile",
                        "dritte Zeile",
                    ]}
                    label={t("Buchungsgrund")}
                    shortLabel={t("Grund")}
                    arrow
                    // extendedWidth
                />
            </SmoothCollapse>
            <Fade in={!exceedsBookableRange}>
                <Notice>
                    Bitte berücksichtige bei deiner Anfrage eine
                    Bearbeitungszeit von ca. 24 Stunden.
                    <br />
                    <br />
                    Wichtig: Anfragen für Samstag, Sonntag und Montag müssen bis
                    Donnerstag 16 Uhr gestellt werden. Am Wochenende können
                    i.d.R. keine Anfragen bearbeitet werden.
                </Notice>
            </Fade>
            {/* <FormElementBase>
                <FormElementLabel name="Von" />
                <input type="time" value="10:20"></input>
            </FormElementBase>

            <FormElementBase>
                <FormElementLabel name="Bis" />
                <input type="time" value="11:33"></input>
            </FormElementBase> */}
        </>
    );
};

export default SetTimeSubpage;
