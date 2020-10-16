import * as React from "react";
import { LastCheckin, Checkin } from "../../model/Checkin";
import theme from "../../styles/theme";
import { useLocation } from "../api/ApiHooks";
import { useTranslation } from "../../localization";
import EllipseText from "./EllipseText";
import { useRouter } from "next/router";
import { appUrls } from "../../config";

interface LastCheckinsProps {
    checkins: Array<LastCheckin>;
    interactive?: true;
}

const LastCheckins: React.FunctionComponent<LastCheckinsProps> = ({
    checkins,
    interactive
}) => {
    const { locale, t } = useTranslation();
    const router = useRouter();
    const handleCheckinClick = (checkin: LastCheckin) => {
        if (checkin.time_left) return;
        const { location } = checkin;
        const { code } = location;
        router.push(...appUrls.checkin(code));
    };
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
                    margin-left: ${theme.spacing(-1)}px;
                    margin-right: ${theme.spacing(-1)}px;
                    border: 2px solid ${theme.primaryColor};
                    border-radius: ${theme.borderRadius}px;

                }
            `}</style>
            {checkins.map((checkin, index) => {
                const { org_name, org_number, id } = checkin.location;
                const { time_left, time_entered } = checkin;
                const isNow = index === 0;
                const formattedDate = new Date(
                    time_left || time_entered
                ).toLocaleTimeString(locale, {
                    hour: "2-digit",
                    minute: "2-digit",
                });
                const displayDate = isNow ? `  ${t("jetzt")}` : formattedDate;

                const dir: string = time_left ? "←" : "→";

                return (
                    <div
                        onClick={() => handleCheckinClick(checkin)}
                        className={`list-item ${!time_left && interactive ? "list-item-interactable" : ""}`}
                        key={`${id}${index}`}
                    >
                        <span className="room-number">{org_number}</span>{" "}
                        <span className="room-name">{org_name}</span>
                        <span className="checkin-time">
                            {dir} {displayDate}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default LastCheckins;
