import React, { useEffect, useRef, useState } from "react";
import { ArrowRight } from "react-feather";
import SmoothCollapse from "react-smooth-collapse";
import { requestSubpages } from "../../../config";
import { useTranslation } from "../../../localization";
import useReservationState from "../../../src/hooks/useReservationState";
import useValidation from "../../../src/hooks/useValidation";
import {
    addDates,
    addDateTime,
    createDate,
    createDateNow,
    createTime,
    createTimeFromDate,
    createTimeNow,
    duration,
    mergeDateAndTime,
    smallerThan,
    Time,
    timeFromDateOrNow,
} from "../../../src/util/DateTimeUtil";
import { calculateBookableRange } from "../../../src/util/ReservationUtil";
import { empty, notEmpty } from "../../../src/util/TypeUtil";
import { getReservationRequest } from "../../api/ApiService";
import useSubPage from "../../api/useSubPage";
import { useAppState } from "../../common/AppStateProvider";
import Fade from "../../common/Fade";
import FormDateInput from "../../common/FormDateInput";
import FormElement from "../../common/FormElement";
import FormTimeInput from "../../common/FormTimeInput";
import NewButton from "../../common/NewButton";
import Notice from "../../common/Notice";

interface SetTimeSubpageProps {}

const SetTimeSubpage: React.FunctionComponent<SetTimeSubpageProps> = ({}) => {
    const { hasError, getError } = useValidation();
    const { t } = useTranslation("request-time");
    const { goForward } = useSubPage(requestSubpages);
    const firstRender = useRef(true);

    const [begin, setBegin] = useReservationState("begin");
    const [end, setEnd] = useReservationState("end");
    const [date, setDate] = useState<Date | undefined>(begin);
    const [timeFrom, setTimeFrom] = useState<Time | undefined>(
        begin ? createTimeFromDate(begin) : undefined
    );
    const [timeTo, setTimeTo] = useState<Time | undefined>(
        end ? createTimeFromDate(end) : undefined
    );
    const hasOverlap =
        notEmpty(timeFrom) && notEmpty(timeTo) && smallerThan(timeTo, timeFrom);
    const exceedsBookableRange =
        hasError("exceedsBookableRange") && hasError("needsExceptionReason");

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
            <Fade in={!exceedsBookableRange}>
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
