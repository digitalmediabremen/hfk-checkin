import Link from "next/link";
import React, { FunctionComponent, useEffect, useState } from "react";
import {
    ArrowRight,
    ChevronsDown,
    EyeOff
} from "react-feather";
import needsProfile from "../../components/api/needsProfile";
import showIf from "../../components/api/showIf";
import AlignContent from "../../components/common/AlignContent";
import GroupedList from "../../components/common/GroupedList";
import Layout from "../../components/common/Layout";
import Loading, { LoadingInline } from "../../components/common/Loading";
import NewButton from "../../components/common/NewButton";
import Notice from "../../components/common/Notice";
import Reservation from "../../components/common/Reservation";
import Subtitle from "../../components/common/Subtitle";
import { appUrls, environment } from "../../config";
import features from "../../features";
import { useTranslation } from "../../localization";
import useReservations from "../../src/hooks/useReservations";
import MyProfile from "../../src/model/api/MyProfile";
import ReservationModel, {
    MyReservation
} from "../../src/model/api/Reservation";
import { isNow } from "../../src/util/DateTimeUtil";
import * as format from "../../src/util/TimeFormatUtil";

interface ReservationsPageProps {
    profile: MyProfile;
    profileUpdating: boolean;
}

const sort = (a: MyReservation, b: MyReservation) =>
    a.begin.getTime() - b.begin.getTime();

const headerProvider = (groupKey: string, firstValue: MyReservation) => (
    <Subtitle center bold>
        {groupKey}
    </Subtitle>
);

const EmptyState = () => {
    const { t } = useTranslation("reservation");
    return (
        <>
            <Notice bottomSpacing={4}>
                {t("Es gibt keine bevorstehenden Buchungen.")}
            </Notice>
        </>
    );
};

const GroupedReservationList: FunctionComponent<{
    reservations: ReservationModel[];
}> = ({ reservations }) => {
    const { t, locale } = useTranslation("reservation");

    const groupBy = (value: MyReservation): string =>
        format.dateRelative(value.begin, locale);

    return (
        <GroupedList
            items={reservations}
            by={groupBy}
            headerProvider={headerProvider}
            sort={sort}
        >
            {(reservation, last) => (
                <Link
                    href={appUrls.reservation(reservation.identifier)[0]}
                    as={appUrls.reservation(reservation.identifier)[1]}
                >
                    <a>
                        <Reservation
                            above={
                                isNow(reservation.begin, 60 * 3) &&
                                reservation.state === "confirmed"
                            }
                            includeState={true}
                            includeDate={false}
                            includeTime={reservation.state !== "cancelled"}
                            includeResourceNumber={
                                reservation.state !== "cancelled"
                            }
                            extendedWidth
                            reservation={reservation}
                            bottomSpacing={last ? 2 : 1}
                            actionIcon={<ArrowRight strokeWidth={1} />}
                        />
                    </a>
                </Link>
            )}
        </GroupedList>
    );
};

const ReservationsPage: FunctionComponent<ReservationsPageProps> = ({
    profile,
}) => {
    const api = useReservations();
    const apiPast = useReservations(true);

    const [showPast, toggleShowPast] = useState(false);
    const { t } = useTranslation("reservation");

    useEffect(() => {
        api.request();
        apiPast.request();
    }, []);

    const pastIcon = (() => {
        const loading = apiPast.state === "loading" && (
            <LoadingInline loading />
        );
        const chevron = showPast ? (
            <EyeOff strokeWidth={1} />
        ) : (
            <ChevronsDown strokeWidth={1} />
        );
        return loading || chevron;
    })();

    const pastButton = (
        <NewButton
            noOutline
            noPadding
            onClick={() => toggleShowPast(!showPast)}
            iconRight={pastIcon}
        >
            {showPast && !!apiPast.result
                ? t("Vergangene ausblenden")
                : t("Vergangene einblenden")}
        </NewButton>
    );

    return (
        <Layout title={t("Buchungsübersicht")}>
            {environment === "staging" && (
                <NewButton
                    onClick={() => {
                        throw new Error("This is a test error");
                    }}
                >
                    Track error
                </NewButton>
            )}
            <Loading loading={api.state === "loading"}>
                {api.state === "success" && (
                    <>
                        {api.result!.length === 0 && <EmptyState />}
                        {api.result!.length > 0 && (
                            <GroupedReservationList
                                reservations={api.result!}
                            />
                        )}
                        {showPast &&
                            apiPast.result &&
                            apiPast.result.length > 0 && (
                                <>
                                    {pastButton}
                                    <GroupedReservationList
                                        reservations={apiPast.result!}
                                    />
                                </>
                            )}
                        {!!apiPast.result && apiPast.result.length > 0 && (
                            <>{pastButton}</>
                        )}
                    </>
                )}
            </Loading>
            <AlignContent offsetBottomPadding>
                <Link href={appUrls.setprofile} passHref>
                    <NewButton noBottomSpacing>{t("Telefon ändern")}</NewButton>
                </Link>
            </AlignContent>
        </Layout>
    );
};

export default showIf(
    () => features.getin,
    needsProfile<ReservationsPageProps>(ReservationsPage)
);
