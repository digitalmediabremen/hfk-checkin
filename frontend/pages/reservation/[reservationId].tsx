import { useRouter } from "next/router";
import React from "react";
import { Copy, X } from "react-feather";
import needsProfile from "../../components/api/needsProfile";
import showIf from "../../components/api/showIf";
import { useSubPageWithState } from "../../components/api/useSubPage";
import AlignContent from "../../components/common/AlignContent";
import AnimatedIcon from "../../components/common/CheckinSuccessIcon";
import CompleteReservation from "../../components/common/CompleteReservation";
import FormText from "../../components/common/FormText";
import Layout from "../../components/common/Layout";
import Loading from "../../components/common/Loading";
import NewButton from "../../components/common/NewButton";
import SubPage from "../../components/common/SubPage";
import SubPageBar from "../../components/common/SubPageBar";
import Subtitle from "../../components/common/Subtitle";
import { AdditionalRequestSubPageProps } from "../../components/getin/subpages/AdditionalRequestSubPage";
import { createDynamicPage } from "../../components/getin/subpages/SubpageCollection";
import { appUrls } from "../../config";
import features from "../../features";
import { useTranslation } from "../../localization";
import useParam from "../../src/hooks/useParam";
import useReservation from "../../src/hooks/useReservation";
import useStatus from "../../src/hooks/useStatus";
import { getIcon } from "../../src/util/ReservationUtil";
import Page404 from "../404";

interface ReservationPageProps {}

const DynamicAdditionalRequestSubPage =
    createDynamicPage<AdditionalRequestSubPageProps>(
        () => import("../../components/getin/subpages/AdditionalRequestSubPage")
    );

const ReservationPage: React.FunctionComponent<ReservationPageProps> = ({}) => {
    const [id] = useParam("reservationId");
    const router = useRouter();

    const {
        result: reservation,
        notFound,
        error,
        reservationSuccess,
        cancel,
    } = useReservation(id);

    const showCancelButton =
        reservation?.state !== "denied" && reservation?.state !== "cancelled";

    const { setNotice } = useStatus();

    const { t } = useTranslation("reservation");
    const { direction, activeSubPage, subPageProps, handlerProps } =
        useSubPageWithState();

    const handleCancel = () => {
        if (!reservation) return;

        const c = window.confirm(
            `${t(
                "Bist du sicher, dass du deine Buchung stornieren willst? Diese Aktion lässt sich nicht rückgängig machen."
            )}`
        );

        if (!c) return;

        (async () => {
            const { error } = await cancel();
            await router.push(appUrls.reservations);

            if (!error) {
                setNotice(
                    t("Deine Buchung {identifier} wurde storniert.", {
                        identifier: reservation.identifier,
                    })
                );
            }
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
                        title={`#${reservation.identifier} / Buchung`}
                        overrideHeader={
                            <SubPageBar
                                title={`#${reservation.identifier}`}
                                onBack={() => router.push(appUrls.reservations)}
                            />
                        }
                        direction={direction}
                        activeSubPage={activeSubPage}
                        subPages={
                            <>
                                <SubPage
                                    title={t("aus Anfrage übernehmen")}
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
                                    <AnimatedIcon
                                        icon={getIcon(reservation.state)}
                                    />
                                    <Subtitle>
                                        {t("Deine Anfrage ist eingegangen.")}
                                    </Subtitle>
                                </>
                                <FormText paragraph>
                                    {reservation?.state_verbose}
                                </FormText>
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
                                                    <X strokeWidth={1} />
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
                                            primary
                                            iconRight={<Copy strokeWidth={2} />}
                                            {...handlerProps("additional")}
                                        >
                                            {t("Anfrage kopieren")}
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

export default showIf(() => features.getin, needsProfile(ReservationPage));
