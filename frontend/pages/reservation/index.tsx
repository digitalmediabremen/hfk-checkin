import Link from "next/link";
import { useRouter } from "next/router";
import React, { FunctionComponent, useEffect } from "react";
import { ArrowRight } from "react-feather";
import needsProfile from "../../components/api/needsProfile";
import GroupedList from "../../components/common/GroupedList";
import Layout from "../../components/common/Layout";
import Loading from "../../components/common/Loading";
import NewButton from "../../components/common/NewButton";
import Notice from "../../components/common/Notice";
import Reservation from "../../components/common/Reservation";
import Subtitle from "../../components/common/Subtitle";
import { appUrls } from "../../config";
import { useTranslation } from "../../localization";
import useReservations from "../../src/hooks/useReservations";
import MyProfile from "../../src/model/api/MyProfile";
import { MyReservation } from "../../src/model/api/Reservation";
import { isNow, isToday } from "../../src/util/DateTimeUtil";
import * as format from "../../src/util/TimeFormatUtil";

interface ReservationsPageProps {
    profile: MyProfile;
    profileUpdating: boolean;
}

const sort = (a: MyReservation, b: MyReservation) =>
    a.begin.getTime() - b.begin.getTime();

const headerProvider = (groupKey: string, firstValue: MyReservation) => (
    <Subtitle center>{groupKey}</Subtitle>
);

const EmptyState = () => {
    const { t } = useTranslation("reservation");
    return (
        <>
            <Notice bottomSpacing={4}>
                {t("Noch hast du keine Buchungsanfragen gestellt.")}
            </Notice>
            <Link href={appUrls.request} passHref>
                <NewButton componentType="a">
                    {t("Neue Buchungsanfrage")}
                </NewButton>
            </Link>
        </>
    );
};

const ReservationsPage: FunctionComponent<ReservationsPageProps> = ({
    profile,
}) => {
    const api = useReservations();
    const { t, locale } = useTranslation("reservation");

    const groupBy = (value: MyReservation): string =>
        format.dateRelative(value.begin, locale);

    useEffect(() => {
        api.request();
    }, []);

    return (
        <Layout>
            <Subtitle>{t("Buchungen")}</Subtitle>
            <Loading loading={api.state === "loading"}>
                {api.state === "success" && (
                    <>
                        {api.result.length === 0 && <EmptyState />}
                        <GroupedList
                            items={api.result}
                            by={groupBy}
                            headerProvider={headerProvider}
                            sort={sort}
                        >
                            {(reservation, last) => (
                                <Link
                                    href={
                                        appUrls.reservation(
                                            reservation.identifier
                                        )[0]
                                    }
                                    as={
                                        appUrls.reservation(
                                            reservation.identifier
                                        )[1]
                                    }
                                >
                                    <a>
                                        <Reservation
                                            above={
                                                isNow(
                                                    reservation.begin,
                                                    60 * 3
                                                ) &&
                                                reservation.state ===
                                                    "confirmed"
                                            }
                                            includeState
                                            extendedWidth
                                            reservation={reservation}
                                            bottomSpacing={last ? 2 : 1}
                                            actionIcon={
                                                <ArrowRight strokeWidth={1} />
                                            }
                                        />
                                    </a>
                                </Link>
                            )}
                        </GroupedList>
                    </>
                )}
            </Loading>
        </Layout>
    );
};

export default needsProfile<ReservationsPageProps>(ReservationsPage);
