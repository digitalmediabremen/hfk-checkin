import { useRouter } from "next/router";
import React, { forwardRef } from "react";
import { Copy, X, XCircle } from "react-feather";
import needsProfile from "../../components/api/needsProfile";
import useSubPage from "../../components/api/useSubPage";
import AlignContent from "../../components/common/AlignContent";
import CheckinSucessIcon from "../../components/common/CheckinSuccessIcon";
import CompleteReservation from "../../components/common/CompleteReservation";
import Layout from "../../components/common/Layout";
import Loading from "../../components/common/Loading";
import NewButton from "../../components/common/NewButton";
import Reservation from "../../components/common/Reservation";
import SubPage from "../../components/common/SubPage";
import SubPageBar from "../../components/common/SubPageBar";
import Subtitle from "../../components/common/Subtitle";
import Text from "../../components/common/Text";
import Title from "../../components/common/Title";
import { AdditionalRequestSubPageProps } from "../../components/getin/subpages/AdditionalRequestSubPage";
import { createDynamicPage } from "../../components/getin/subpages/SubpageCollection";
import { appUrls, buildSubPageUrl } from "../../config";
import { useTranslation } from "../../localization";
import useParam from "../../src/hooks/useParam";
import useReservation from "../../src/hooks/useReservation";
import useStatus from "../../src/hooks/useStatus";
import Page404 from "../404";

interface ReservationPageProps {}

const DynamicAdditionalRequestSubPage = createDynamicPage<AdditionalRequestSubPageProps>(
    () => import("../../components/getin/subpages/AdditionalRequestSubPage")
);

const ReservationPage: React.FunctionComponent<ReservationPageProps> = ({}) => {
    const [id] = useParam("reservationId");
    const router = useRouter();

    const {
        reservation,
        notFound,
        error,
        reservationSuccess,
        cancel,
    } = useReservation(id);

    const showCancelButton =
        reservation?.state !== "denied" && reservation?.state !== "cancelled";

    const { setNotice } = useStatus();

    const { t } = useTranslation("reservation");
    const { direction, activeSubPage, subPageProps, handlerProps } = useSubPage(
        {
            urlProvider: (name, param) =>
                buildSubPageUrl(appUrls.reservation(id || "")[1], name, param),
            subpages: {
                new: {},
            } as const,
        }
    );

    const handleCancel = () => {
        if (!reservation) return;

        const c = window.confirm(
            `${t(
                "Bist du sicher, dass du deine Buchung stornieren willst? Diese Aktion lässt sich nicht rückgängig machen."
            )}`
        );

        if (!c) return;

        (async () => {
            await cancel();
            if (error) return;
            await router.push(appUrls.reservations);
            setNotice(
                t('Deine Buchung "{identifier}" wurde storniert.', {
                    identifier: reservation.identifier,
                })
            );
        })();
    };

    if (!id) return null;
    if (notFound) return <Page404 />;
    // if (error) return <Error error={error} />;

    return (
        <Loading loading={!reservation}>
            {!!reservation && (
                <>
                    <style jsx>{``}</style>
                    <Layout
                        overrideHeader={
                            <SubPageBar title={`#${reservation.identifier}`} onBack={() => router.push(appUrls.reservations)} />
                        }
                        direction={direction}
                        activeSubPage={activeSubPage}
                        subPages={
                            <>
                                <SubPage
                                    title={t("Weitere Anfrage")}
                                    {...subPageProps("additional")}
                                    // todo: hack callback state is not updated
                                    // use state directly and not via subpageprops
                                    active={"additional" === activeSubPage}
                                >
                                    {() => (
                                        <DynamicAdditionalRequestSubPage
                                            reservation={reservation}
                                        />
                                    )}
                                </SubPage>
                            </>
                        }
                    >
                        {reservationSuccess && (
                            <>
                                <>
                                    <CheckinSucessIcon />
                                    <Subtitle>
                                        {t("Deine Anfrage ist eingegangen.")}
                                    </Subtitle>
                                </>
                                <Text paragraph>
                                    {reservation?.state_verbose}
                                </Text>
                            </>
                        )}

                        {reservation && (
                            <>
                                <CompleteReservation
                                    includeState={!reservationSuccess}
                                    reservation={reservation}
                                    bottomSpacing={2}
                                    extendedWidth
                                />

                                {/* <Text paragraph>
                                    <b>1. Reservierung anfragen</b>
                                    <br />
                                    2. Auf Bearbeitung warten
                                    <br />
                                    3. Schlüssel an der Pforte holen <br />
                                    4. Am Raum einchecken <br />
                                    5. Raum nutzen <br />
                                    6. Aus Raum auschecken <br />
                                    7. Schlüssel zurückgeben
                                    <br />
                                </Text> */}
                            </>
                        )}
                        {(reservationSuccess || true) && (
                            <>
                                <AlignContent
                                    align="bottom"
                                    offsetBottomPadding
                                >
                                    <div style={{ width: "100%" }}>
                                        {showCancelButton && (
                                            <NewButton
                                                iconRight={
                                                    <XCircle strokeWidth={1} />
                                                }
                                                bottomSpacing={2}
                                                onClick={handleCancel}
                                                // extendedWidth
                                            >
                                                {t("Stornieren")}
                                            </NewButton>
                                        )}
                                        <NewButton
                                            noBottomSpacing
                                            iconRight={<Copy strokeWidth={1} />}
                                            {...handlerProps("additional")}
                                        >
                                            {t("weitere Anfrage")}
                                        </NewButton>
                                    </div>
                                </AlignContent>
                            </>
                        )}
                    </Layout>
                </>
            )}
        </Loading>
    );
};

export default needsProfile(ReservationPage);
