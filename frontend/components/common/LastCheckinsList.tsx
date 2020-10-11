import * as React from "react";
import { LastCheckin } from "../../model/Checkin";
import theme from "../../styles/theme";

interface LastCheckinsProps {
    checkins: Array<LastCheckin>;
}

const LastCheckins: React.FunctionComponent<LastCheckinsProps> = ({
    checkins,
}) => {
    return (
        <div className="list">
            <style jsx>{`
                div {
                    color: ${theme.primaryColor};
                }

                .room-number {
                    width: 5em;
                    display: inline-block;
                }

                .room-name {
                    font-weight: bold;
                    display: inline-block;
                }

                .list {
                    margin-bottom: ${theme.spacing(3)}px;
                }

                .list-item {
                    margin-bottom: ${theme.spacing(0.5)}px;
                }
            `}</style>
            {checkins.map((checkin, index) => {
                const { org_name, org_number, id } = checkin.location;
                return (
                    <div className="list-item" key={`${id}${index}`}>
                        <span className="room-number">{org_number}</span>{" "}
                        <span className="room-name">{org_name}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default LastCheckins;
