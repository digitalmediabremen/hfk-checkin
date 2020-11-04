import { useRouter } from "next/router";
import * as React from "react";
import { appUrls } from "../../config";
import { useTranslation } from "../../localization";
import { LastCheckin } from "../../model/Checkin";
import theme from "../../styles/theme";
import { stringify } from "querystring";
import Subtitle from "./Subtitle";

interface LastCheckinsProps {
    checkins: Array<LastCheckin>;
    onCheckinClick?: (index: number) => void;
    groupByDate?: boolean;
}

const useForceUpdateAfter = (afterSeconds: number = 30) => {
    const [, setState] = React.useState<{} | undefined>();
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setState({});
        }, afterSeconds * 1000);
        return () => clearTimeout(timer);
    }, []);
};

const timeWithinDateIsConsideredNow = 30;

const isNow = (date: Date) =>
    new Date().getTime() - date.getTime() <
    timeWithinDateIsConsideredNow * 1000;

const isToday = (date: Date) =>
    new Date().toDateString() === date.toDateString();

const groupByDay = (
    checkins: LastCheckin[]
): Array<[string, LastCheckin[]]> => {
    const rtf = new Intl.DateTimeFormat("de");
    return Object.entries(
        checkins.reduce<Record<string, LastCheckin[]>>((groups, checkin) => {
            const date = new Date(checkin.time_left || checkin.time_entered);
            const today = isToday(date);
            const dateFormatted = !today ? rtf.format(date) : "";
            const listHead = Object.keys(groups).pop();
            const currentHead =
                listHead === dateFormatted ? listHead : dateFormatted;
            const list = groups[currentHead] || [];
            list.push(checkin);
            groups[currentHead] = list;
            return groups;
        }, {})
    );
};

const LastCheckins: React.FunctionComponent<LastCheckinsProps> = ({
    checkins,
    onCheckinClick,
    groupByDate,
}) => {
    const checkinsByDate = React.useMemo(
        () => (groupByDate ? groupByDay(checkins) : []),
        [checkins, groupByDate]
    );

    // after 30s thie component is rerendered
    useForceUpdateAfter(timeWithinDateIsConsideredNow);

    return (
        <div className="list">
            <style jsx>{`
                div {
                    color: ${theme.primaryColor};
                }
            `}</style>
            {groupByDate &&
                checkinsByDate.map(([date, checkins], groupIndex) => {
                    const checkinItems = checkins.map((checkin, index) => (
                        <LastCheckinListItem
                            checkin={checkin}
                            index={groupIndex * checkins.length + index}
                            onCheckinClick={onCheckinClick}
                            key={index}
                        />
                    ));

                    return (
                        <div key={groupIndex}>
                            {date && <Subtitle center>{date}</Subtitle>}
                            {checkinItems}
                        </div>
                    );
                })}
            {!groupByDate &&
                checkins.map((checkin, index) => (
                    <LastCheckinListItem
                        checkin={checkin}
                        index={index}
                        onCheckinClick={onCheckinClick}
                        key={index}
                    />
                ))}
        </div>
    );
};

const LastCheckinListItem = ({
    checkin,
    onCheckinClick,
    index,
}: {
    index: number;
    checkin: LastCheckin;
    onCheckinClick?: (index: number) => void;
}) => {
    const { org_name, org_number, id } = checkin.location;
    const { time_left, time_entered } = checkin;
    const { t, locale } = useTranslation();
    const interactive = !!onCheckinClick;

    let displayDate: Date = new Date(time_left || time_entered);
    // checkin is not older than 30 seconds
    const now: boolean = isNow(displayDate);
    let formattedDate: string = displayDate.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
    });
    formattedDate = now && index === 0 ? `  ${t("jetzt")}` : formattedDate;
    const dir: string = time_left ? "←" : "→";

    return (
        <>
            <style jsx>{`
                div {
                    color: ${theme.primaryColor};
                }

                .room-number {
                    width: 4.5em;
                    display: inline-block;
                    flex-shrink: 0;
                    flex-grow: 0.5;
                    flex-basis: 3.5em;
                }

                .room-name {
                    font-weight: bold;
                    display: inline-block;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    flex-grow: 3;
                    flex-shrink: 0;
                    flex-basis: 0;
                }

                .checkin-time {
                    flex-shrink: 0;
                    margin-left: auto;
                    padding-left: ${theme.spacing(1)}px;
                    white-space: pre-wrap;
                }

                .list {
                    margin-bottom: ${theme.spacing(0)}px;
                }

                .list-item {
                    display: flex;
                    margin-bottom: ${theme.spacing(1)}px;
                }

                .list-item-interactable {
                    padding: ${theme.spacing(1)}px;
                    // -2 to compensate border width
                    margin-left: ${theme.spacing(-1) - 2}px;
                    margin-right: ${theme.spacing(-1) - 2}px;
                    border: 2px solid ${theme.primaryColor};
                    border-radius: ${theme.borderRadius}px;
                    transition: 0.1s background-color, 0.1s color;
                }

                .list-item-interactable {
                    // font-weight: bold;
                }

                .list-item-interactable:hover {
                    cursor: pointer;
                    background-color: ${theme.primaryColor};
                    color: #fff;
                }
            `}</style>
            <div
                onClick={() => onCheckinClick?.(index)}
                className={`list-item ${
                    !time_left && interactive ? "list-item-interactable" : ""
                }`}
            >
                <span className="room-number">{org_number}</span>{" "}
                <span className="room-name">{org_name}</span>
                <span className="checkin-time">
                    {dir} {formattedDate}
                </span>
            </div>
        </>
    );
};

export default LastCheckins;
