import * as React from "react";
import { useTranslation } from "../../localization";
import { LastCheckin } from "../../model/Checkin";
import theme from "../../styles/theme";
import Subtitle from "./Subtitle";
import { useAppState } from "./AppStateProvider";

interface LastCheckinsProps {
    checkins: Array<LastCheckin>;
    onCheckinClick?: (index: number) => void;
    groupByDate?: boolean;
    showCheckoutSeperatly?: true;
    extendInteractableWidth?: true;
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

type IndexedLastCheckin = LastCheckin & { originalIndex?: number };

const indexCheckin = (checkins: LastCheckin[]): IndexedLastCheckin[] =>
    checkins.map((checkin, index) => {
        (checkin as IndexedLastCheckin).originalIndex = index;
        return checkin;
    });

const spreadToCheckinCheckout = (checkins: LastCheckin[]): LastCheckin[] =>
    checkins
        .reduce<LastCheckin[]>((checkinsSpreaded, _checkin, index) => {
            const checkin = Object.assign({}, _checkin);

            if (checkin.time_left) {
                const checkout = Object.assign({}, _checkin);
                checkin.time_left = null;
                checkinsSpreaded.push(checkout);
            }
            checkinsSpreaded.push(checkin);
            return checkinsSpreaded;
        }, [])
        .sort((a, b) => {
            const ad = new Date(a.time_left || a.time_entered).getTime();
            const bd = new Date(b.time_left || b.time_entered).getTime();
            return bd - ad;
        });

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

const useHighlightedCheckin = () => {
    const { appState, dispatch } = useAppState();
    const [id] = React.useState(appState.highlightCheckinById);
    React.useEffect(() => {
        dispatch({
            type: "highlightedCheckinWasDisplayed",
        });
    }, []);
    return id;
};

const LastCheckins: React.FunctionComponent<LastCheckinsProps> = ({
    checkins,
    onCheckinClick,
    groupByDate,
    showCheckoutSeperatly,
    extendInteractableWidth,
}) => {
    const { t } = useTranslation();
    checkins = indexCheckin(checkins);
    checkins = React.useMemo(
        () =>
            showCheckoutSeperatly
                ? spreadToCheckinCheckout(checkins)
                : checkins,
        [checkins, showCheckoutSeperatly]
    );
    const checkinsByDate = React.useMemo(
        () => (groupByDate ? groupByDay(checkins) : []),
        [checkins, groupByDate]
    );

    const highlightedCheckinId = useHighlightedCheckin();

    const handleCheckinClick = onCheckinClick
        ? (checkin: LastCheckin) => {
              const originalIndex = (checkin as IndexedLastCheckin)
                  .originalIndex;
              if (originalIndex !== undefined) onCheckinClick(originalIndex);
              else throw "originalIndex missing";
          }
        : undefined;

    // after 30s thie component is rerendered
    useForceUpdateAfter(timeWithinDateIsConsideredNow);

    return (
        <div className="list">
            <style jsx>{`
                div {
                    color: ${theme.primaryColor};
                }

                .list-group {
                    margin-top: ${theme.spacing(3)}px;
                }
            `}</style>
            {groupByDate &&
                checkinsByDate.map(([date, checkins], groupIndex) => {
                    const checkinItems = checkins.map((checkin, index) => (
                        <LastCheckinListItem
                            interactive={!!handleCheckinClick}
                            checkin={checkin}
                            index={groupIndex * checkins.length + index}
                            onCheckinClick={() => handleCheckinClick?.(checkin)}
                            key={index}
                            highlight={
                                highlightedCheckinId === checkin.id &&
                                checkin.time_left !== null
                            }
                            interactiveExtendWidth={extendInteractableWidth}
                        />
                    ));

                    return (
                        <div
                            className={date ? "list-group" : ""}
                            key={groupIndex}
                        >
                            {date && <Subtitle center>{date}</Subtitle>}
                            {checkinItems}
                        </div>
                    );
                })}
            {!groupByDate &&
                checkins.map((checkin, index) => (
                    <LastCheckinListItem
                        interactive={!!handleCheckinClick}
                        checkin={checkin}
                        index={index}
                        onCheckinClick={() => handleCheckinClick?.(checkin)}
                        key={index}
                        highlight={
                            highlightedCheckinId === checkin.id &&
                            checkin.time_left !== null
                        }
                        interactiveExtendWidth={extendInteractableWidth}
                    />
                ))}
        </div>
    );
};

const LastCheckinListItem = ({
    checkin,
    onCheckinClick,
    index,
    interactive,
    highlight,
    interactiveExtendWidth,
}: {
    index: number;
    checkin: LastCheckin;
    onCheckinClick?: () => void;
    interactive?: boolean;
    interactiveExtendWidth?: boolean;
    highlight: boolean;
}) => {
    const { org_name, org_number, id } = checkin.location;
    const { time_left, time_entered, is_active } = checkin;
    const { t, locale } = useTranslation();

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
                    // -2 to compensate border width
                    padding: ${theme.spacing(1)}px;
                    border: 2px solid ${theme.primaryColor};
                    border-radius: ${theme.borderRadius}px;
                    transition: 0.1s background-color, 0.1s color;
                }

                .list-item.extend-width {
                    margin-left: ${theme.spacing(-1)}px;
                    margin-right: ${theme.spacing(-1)}px;
                }

                .list-item-interactable {
                    // font-weight: bold;
                }

                .list-item-interactable:hover {
                    cursor: pointer;
                    background-color: ${theme.primaryColor};
                    color: #fff;
                }

                .list-item-highlighted {
                    animation: highlight 1.5s linear;
                    animation-fill-mode: forwards;
                    border-radius: ${theme.borderRadius}px;
                    padding-left: ${theme.spacing(1)}px;
                    padding-right: ${theme.spacing(1)}px;
                }

                @keyframes highlight {
                    0% {
                        background-color: ${theme.primaryColor};
                        color: ${theme.secondaryColor};
                        padding-top: ${theme.spacing(1)}px;
                        padding-bottom: ${theme.spacing(1)}px;
                    }
                    50% {
                        background-color: ${theme.primaryColor};
                        color: ${theme.secondaryColor};
                        padding-top: ${theme.spacing(1)}px;
                        padding-bottom: ${theme.spacing(
                            1
                        )}px; // -2 to compensate border width
                    }
                    90% {
                        background-color: ${theme.secondaryColor};
                        color: ${theme.primaryColor};
                        padding-top: ${theme.spacing(1)}px;
                        padding-bottom: ${theme.spacing(
                            1
                        )}px; // -2 to compensate border width
                    }
                    100% {
                        background-color: ${theme.secondaryColor};
                        color: ${theme.primaryColor};
                        padding-top: ${theme.spacing(0)}px;
                        padding-bottom: ${theme.spacing(0)}px;
                        // -2 to compensate border width
                    }
                }
            `}</style>
            <div
                onClick={onCheckinClick}
                className={`list-item${
                    is_active && interactive ? " list-item-interactable" : ""
                }${highlight ? " list-item-highlighted" : ""}${
                    ((interactiveExtendWidth && is_active && interactive) || highlight)
                        ? " extend-width"
                        : ""
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
