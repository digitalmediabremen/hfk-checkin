import * as React from "react";
import { LastCheckin } from "../../model/Checkin";
import theme from "../../styles/theme";
import { useLocation } from "../api/ApiHooks";
import { useTranslation } from "../../localization";
import EllipseText from "./EllipseText";

interface LastCheckinsProps {
    checkins: Array<LastCheckin>;
}

const LastCheckins: React.FunctionComponent<LastCheckinsProps> = ({
    checkins,
}) => {
    const { locale } = useTranslation();
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
                }

                .room-name {
                    font-weight: bold;
                    display: inline;
                    flex-shrink: 1;
                }

                .checkin-time {
                    flex-shrink: 0;
                    margin-left: auto;
                    padding-left: ${theme.spacing(1)}px;
                }

                .list {
                    margin-bottom: ${theme.spacing(3)}px;
                }

                .list-item {
                    display: flex;
                    margin-bottom: ${theme.spacing(0.5)}px;
                }
            `}</style>
            {checkins.map((checkin, index) => {
                const { org_name, org_number, id } = checkin.location;
                const { time_left, time_entered } = checkin;
                const formatted_date = new Date(
                    time_left || time_entered
                ).toLocaleTimeString(locale, {
                    hour: "2-digit",
                    minute: "2-digit",
                });

                const dir: string = time_left ? "←" : "→";

                return (
                    <div className="list-item" key={`${id}${index}`}>
                        <span className="room-number">{org_number}</span>{" "}
                        <EllipseText>
                            <span className="room-name">{org_name}</span>
                        </EllipseText>
                        <span className="checkin-time">
                            {dir} {formatted_date}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default LastCheckins;
