import React, { useState } from "react";
import SmoothCollapse from "react-smooth-collapse";
import { useTranslation } from "../../../localization";
import {
    addDates,
    createDateNow,
    createTimeNow,
    duration,
    smallerThan,
    Time,
} from "../../../src/util/DateTimeUtil";
import { notEmpty } from "../../../src/util/TypeUtil";
import Fade from "../../common/Fade";
import FormDateInput from "../../common/FormDateInput";
import FormTimeInput from "../../common/FormTimeInput";
import Notice from "../../common/Notice";

interface SetTimeSubpageProps {}

const SetTimeSubpage: React.FunctionComponent<SetTimeSubpageProps> = ({}) => {
    const [date, setDate] = useState<Date | undefined>(createDateNow());
    const [timeFrom, setTimeFrom] = useState<Time | undefined>(createTimeNow());
    const [timeTo, setTimeTo] = useState<Time | undefined>(createTimeNow());
    const { t } = useTranslation();

    const hasOverlap =
        notEmpty(timeFrom) && notEmpty(timeTo) && smallerThan(timeTo, timeFrom);

    const exceedsBookableRange =
        notEmpty(date) &&
        smallerThan(addDates(createDateNow(), duration.days(14)), date);
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
