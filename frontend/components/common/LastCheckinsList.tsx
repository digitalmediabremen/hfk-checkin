import { useRouter } from "next/router";
import * as React from "react";
import { appUrls } from "../../config";
import { useTranslation } from "../../localization";
import { LastCheckin } from "../../model/Checkin";
import theme from "../../styles/theme";

interface LastCheckinsProps {
    checkins: Array<LastCheckin>;
    onCheckinClick?: (index: number) => void;
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

const LastCheckins: React.FunctionComponent<LastCheckinsProps> = ({
    checkins,
    onCheckinClick,
}) => {
    const { locale, t } = useTranslation();
    const interactive = !!onCheckinClick;
    // after 30s thie component is rerendered
    useForceUpdateAfter(timeWithinDateIsConsideredNow);

    return (
        <div className="list">
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
                    margin-bottom: ${theme.spacing(3)}px;
                }

                .list-item {
                    display: flex;
                    margin-bottom: ${theme.spacing(1)}px;
                }

                .list-item-interactable {
                    padding: ${theme.spacing(1)}px;
                    // -2 to compensate border width
                    margin-left: ${theme.spacing(-1) -2}px;
                    margin-right: ${theme.spacing(-1) -2}px;
                    border: 2px solid ${theme.primaryColor};
                    border-radius: ${theme.borderRadius}px;
                    transition: .1s background-color, .1s color;
                }

                .list-item-interactable  {
                    // font-weight: bold;
                }

                .list-item-interactable:hover {
                    cursor: pointer;
                    background-color: ${theme.primaryColor};
                    color: #fff;
                }                
            `}</style>
            {checkins.map((checkin, index) => {
                const { org_name, org_number, id } = checkin.location;
                const { time_left, time_entered } = checkin;

                let displayDate: Date = new Date(time_left || time_entered);
                // checkin is not older than 30 seconds
                const isNow: boolean =
                    new Date().getTime() - displayDate.getTime() <
                    timeWithinDateIsConsideredNow * 1000;
                let formattedDate: string = displayDate.toLocaleTimeString(
                    locale,
                    {
                        hour: "2-digit",
                        minute: "2-digit",
                    }
                );
                formattedDate =
                    isNow && index === 0 ? `  ${t("jetzt")}` : formattedDate;
                const dir: string = time_left ? "←" : "→";

                return (
                    <div
                        onClick={() => onCheckinClick?.(index)}
                        className={`list-item ${
                            !time_left && interactive
                                ? "list-item-interactable"
                                : ""
                        }`}
                        key={`${id}${index}`}
                    >
                        <span className="room-number">{org_number}</span>{" "}
                        <span className="room-name">{org_name}</span>
                        <span className="checkin-time">
                            {dir} {formattedDate}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default LastCheckins;
