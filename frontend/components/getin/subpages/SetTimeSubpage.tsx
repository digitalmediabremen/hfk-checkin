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
import { empty, notEmpty } from "../../../src/util/TypeUtil";
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
    const { hasError } = useValidation();
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
    }, [])

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
                    title={t(
                        "Räume können nur mit einer Vorlaufzeit von max. 14 Tagen gebucht werden."
                    )}
                >
                    {t(
                        "Bitte wähle ein anderes Datum aus oder gib eine Ausnahmeregelung an."
                    )}
                    <br />
                    <br />
                    <NewButton
                        noOutline
                        iconRight={<ArrowRight />}
                        onClick={() => goForward("purpose")}
                    >
                        {t("Ausnahmeregelung")}
                    </NewButton>
                </Notice>
            </Fade>
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
