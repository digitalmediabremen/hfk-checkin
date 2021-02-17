import { time } from "console";
import React, {
    ChangeEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { useTranslation } from "../../../localization";
import {
    createTimeNow,
    smallerThan,
    Time,
} from "../../../src/util/DateTimeUtil";
import { notEmpty } from "../../../src/util/TypeUtil";
import FormDateInput from "../../common/FormDateInput";
import FormElementBase from "../../common/FormElementBase";
import FormElementLabel from "../../common/FormElementLabel";
import FormTimeInput from "../../common/FormTimeInput";
import { Input } from "../../common/Input";
import Notice from "../../common/Notice";

interface SetTimeSubpageProps {}

const SetTimeSubpage: React.FunctionComponent<SetTimeSubpageProps> = ({}) => {
    const [date, setDate] = useState<Date | undefined>();
    const [timeFrom, setTimeFrom] = useState<Time | undefined>(createTimeNow());
    const [timeTo, setTimeTo] = useState<Time | undefined>(createTimeNow());

    const hasOverlap =
        notEmpty(timeFrom) && notEmpty(timeTo) && smallerThan(timeTo, timeFrom);

    return (
        <>
            <style jsx>{``}</style>

            <FormDateInput label="Datum" value={date} onChange={setDate} />
            <FormTimeInput label="Von" value={timeFrom} onChange={setTimeFrom} />
            <FormTimeInput
                label="Bis"
                value={timeTo}
                onChange={setTimeTo}
                bottomSpacing={3}
                hasOverlap={hasOverlap}
            />
            <Input label="test" name="test" value="test" />

            <Notice>
                Bitte berücksichtige bei deiner Anfrage eine Bearbeitungszeit
                von ca. 24 Stunden.
                <br />
                <br />
                Wichtig: Anfragen für Samstag, Sonntag und Montag müssen bis
                Donnerstag 16 Uhr gestellt werden. Am Wochenende können i.d.R.
                keine Anfragen bearbeitet werden.
            </Notice>

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
