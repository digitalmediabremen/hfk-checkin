import React, { useEffect, useRef, useState } from "react";
import { ArrowRight } from "react-feather";
import { requestSubpages } from "../../../config";
import { useTranslation } from "../../../localization";
import useDelayedCallback from "../../../src/hooks/useDelayedCallback";
import useReservationState from "../../../src/hooks/useReservationState";
import useTheme from "../../../src/hooks/useTheme";
import useValidation from "../../../src/hooks/useValidation";
import FullCalendarEventOnResource from "../../../src/model/api/FullCalendarEventOnResource";
import {
    addDateTime,
    createDateNow,
    createDefaultTime,
    createTimeFromDate,
    duration,
    mergeDateAndTime,
    smallerThan,
    Time,
} from "../../../src/util/DateTimeUtil";
import { notEmpty } from "../../../src/util/TypeUtil";
import useSubPage from "../../api/useSubPage";
import Fade from "../../common/Fade";
import FormDateInput from "../../common/FormDateInput";
import FormTimeInput from "../../common/FormTimeInput";
import NewButton from "../../common/NewButton";
import Notice from "../../common/Notice";
import ResourceCalendar from "../../common/ResourceCalendar";

interface SetTimeSubpageProps {}

const SetTimeSubpage: React.FunctionComponent<SetTimeSubpageProps> = ({}) => {
    const { hasError, getError } = useValidation();
    const { t } = useTranslation("request-time");
    const { goForward } = useSubPage(requestSubpages);
    const firstRender = useRef(true);
    const theme = useTheme();
    const mobile = !theme.isDesktop;

    const [begin, setBegin] = useReservationState("begin");
    const [end, setEnd] = useReservationState("end");
    const [resource] = useReservationState("resource");
    const [date, setDate] = useState<Date | undefined>(begin);
    // const default
    const defaultBegin = createTimeFromDate(
        addDateTime(createDefaultTime(), duration.hours(0))
    );
    const defaultEnd = createTimeFromDate(
        addDateTime(defaultBegin, duration.hours(2))
    );
    const [timeFrom, setTimeFrom] = useState<Time | undefined>(
        begin ? createTimeFromDate(begin) : defaultBegin
    );
    const [timeTo, setTimeTo] = useState<Time | undefined>(
        end ? createTimeFromDate(end) : defaultEnd
    );
    const hasOverlap =
        notEmpty(timeFrom) && notEmpty(timeTo) && smallerThan(timeTo, timeFrom);
    const exceedsBookableRange =
        hasError("exceedsBookableRange") && hasError("needsExceptionReason");
    const [currentRequestEventArray, setCurrentRequestEventArray] =
        useState<Array<FullCalendarEventOnResource> | undefined>();
    // update date values
    useEffect(() => {
        if (firstRender.current) return;
        if (notEmpty(date) && notEmpty(timeFrom) && notEmpty(timeTo)) {
            const from = mergeDateAndTime(date, timeFrom);
            let to = mergeDateAndTime(date, timeTo);
            if (hasOverlap) {
                to = addDateTime(to, duration.days(1));
            }
            setBegin(from);
            setEnd(to);
        }
    }, [date, timeFrom, timeTo, hasOverlap, firstRender]);

    useEffect(() => {
        firstRender.current = false;
    }, []);

    const updateCurrentRequestArray = useDelayedCallback(
        (events: Array<FullCalendarEventOnResource> | undefined) => {
            setCurrentRequestEventArray(events);
        },
        300
    );

    useEffect(() => {
        if (!begin || !end) return;
        updateCurrentRequestArray([
            {
                title: t("Deine Buchung"),
                id: "currentRequest",
                start: begin,
                end: end,
            },
        ]);
    }, [begin, end]);

    return (
        <>
            <style jsx>{``}</style>

            <FormDateInput
                label={t("Datum")}
                value={date}
                onChange={setDate}
                bottomSpacing={2}
                minValue={createDateNow()}
                extendedWidth
            />

            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <FormTimeInput
                    width="half"
                    label={t("Von")}
                    value={timeFrom}
                    onChange={setTimeFrom}
                    bottomSpacing={1}
                    extendedWidth
                />
                <FormTimeInput
                    width="half"
                    label={t("Bis")}
                    value={timeTo}
                    onChange={setTimeTo}
                    bottomSpacing={4}
                    hasOverlap={hasOverlap}
                    extendedWidth
                />
            </div>

            {/* show notices after booking request */}

            <Fade in={exceedsBookableRange}>
                <Notice
                    error
                    bottomSpacing={2}
                    title={getError("exceedsBookableRange").join("\n")}
                >
                    {t(
                        "Bitte wähle ein frühreres Datum aus oder gib einen Buchungsgrund an."
                    )}
                    <br />
                    <br />
                    <NewButton
                        noOutline
                        iconRight={<ArrowRight strokeWidth={1} />}
                        onClick={() => goForward("purpose")}
                    >
                        {t("Buchungsgrund angeben")}
                    </NewButton>
                </Notice>
            </Fade>

            {/* <Fade in={!exceedsBookableRange}>
                <Notice bottomSpacing={2}>
                    {t(
                        "Bitte rechne mit einer Bearbeitungszeit von mind. 48 Stunden."
                    )}
                </Notice>
                <Notice bottomSpacing={0}>
                    {t(
                        "Wichtig: Am Wochenende werden in der Regel keine Anfragen bearbeitet. Willst du also eine Werkstatt für Montag um 10 Uhr buchen, stelle deine Anfrage bis spätestens Donnerstag 10 Uhr."
                    )}
                </Notice>
            </Fade> */}

            {resource && (
                <ResourceCalendar
                    hideHeader={mobile}
                    getTitle={() =>
                        `${resource.display_numbers} ${resource.name}`
                    }
                    noFooter
                    resource={resource}
                    events={currentRequestEventArray}
                    date={begin}
                />
            )}

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
