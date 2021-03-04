import React, { FunctionComponent } from "react";
import needsProfile from "../../components/api/needsProfile";
import Layout from "../../components/common/Layout";
import Reservation from "../../components/common/Reservation";
import MyProfile from "../../src/model/api/MyProfile";

interface ReservationsPageProps {
    profile: MyProfile;
    profileUpdating: boolean;
}

const ReservationsPage: FunctionComponent<ReservationsPageProps> = ({
    profile,
}) => {
    const { reservations } = profile;
    return (
        <Layout>
            {reservations.map((reservation) => (
                <Reservation key={reservation.uuid} reservation={reservation} />
            ))}
        </Layout>
    );
};

export default needsProfile<ReservationsPageProps>(ReservationsPage);
