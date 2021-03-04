import Link from "next/link";
import React, { FunctionComponent } from "react";
import needsProfile from "../../components/api/needsProfile";
import GroupedList from "../../components/common/GroupedList";
import Layout from "../../components/common/Layout";
import Reservation from "../../components/common/Reservation";
import SectionTitle from "../../components/common/SectionTitle";
import Subtitle from "../../components/common/Subtitle";
import { appUrls } from "../../config";
import { useTranslation } from "../../localization";
import MyProfile from "../../src/model/api/MyProfile";
import { MyReservation } from "../../src/model/api/Reservation";
import { isToday } from "../../src/util/DateTimeUtil";
import * as format from "../../src/util/TimeFormatUtil";

interface ReservationsPageProps {
    profile: MyProfile;
    profileUpdating: boolean;
}

const sort = (a: MyReservation, b: MyReservation) =>
    b.begin.getTime() - a.begin.getTime();

const groupBy = (value: MyReservation): string =>
    format.date(value.begin, "de");

const headerProvider = (groupKey: string, firstValue: MyReservation) =>
    isToday(firstValue.begin) ? null : (
        <Subtitle key={groupKey} center>
            {groupKey}
        </Subtitle>
    );

const ReservationsPage: FunctionComponent<ReservationsPageProps> = ({
    profile,
}) => {
    const { reservations } = profile;
    const { t } = useTranslation("reservation");
    return (
        <Layout>
            <Subtitle>{t("Buchungsanfragen")}</Subtitle>
            <GroupedList
                items={reservations}
                by={groupBy}
                headerProvider={headerProvider}
                sort={sort}
            >
                {(reservation, last) => (
                    <Link
                        href={appUrls.reservation(reservation.uuid)[0]}
                        as={appUrls.reservation(reservation.uuid)[1]}
                    >
                        <a>
                            <Reservation
                                key={reservation.uuid}
                                reservation={reservation}
                                bottomSpacing={2}
                            />
                        </a>
                    </Link>
                )}
            </GroupedList>
        </Layout>
    );
};

export default needsProfile<ReservationsPageProps>(ReservationsPage);
