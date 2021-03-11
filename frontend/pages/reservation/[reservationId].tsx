import React from "react";
import { Copy, X } from "react-feather";
import needsProfile from "../../components/api/needsProfile";
import useSubPage from "../../components/api/useSubPage";
import AlignContent from "../../components/common/AlignContent";
import CheckinSucessIcon from "../../components/common/CheckinSuccessIcon";
import Layout from "../../components/common/Layout";
import Loading from "../../components/common/Loading";
import NewButton from "../../components/common/NewButton";
import Reservation from "../../components/common/Reservation";
import SubPage from "../../components/common/SubPage";
import Subtitle from "../../components/common/Subtitle";
import Text from "../../components/common/Text";
import { AdditionalRequestSubPageProps } from "../../components/getin/subpages/AdditionalRequestSubPage";
import { createDynamicPage } from "../../components/getin/subpages/SubpageCollection";
import { appUrls, buildSubPageUrl } from "../../config";
import { useTranslation } from "../../localization";
import useParam from "../../src/hooks/useParam";
import useReservation from "../../src/hooks/useReservation";
import Page404 from "../404";
import Error from "../Error";

interface ReservationPageProps {}

const DynamicAdditionalRequestSubPage = createDynamicPage(
    () => import("../../components/getin/subpages/AdditionalRequestSubPage")
);

const ReservationPage: React.FunctionComponent<ReservationPageProps> = ({}) => {
    const [id] = useParam("reservationId");

    const { reservation, notFound, error, reservationSuccess } = useReservation(
        id
    );

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
    if (!id) return null;

    if (notFound) return <Page404 />;
    if (error) return <Error error={error} />;

    return (
        <Loading loading={!reservation}>
            {!!reservation && (
                <>
                    <style jsx>{``}</style>
                    <Layout
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
                                    {() => <DynamicAdditionalRequestSubPage />}
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
                                <Reservation
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
                                    align="center"
                                    offsetBottomPadding
                                >
                                    <div style={{ width: "100%" }}>
                                        <NewButton
                                            iconRight={<X strokeWidth={1} />}
                                            bottomSpacing={2}
                                            // extendedWidth
                                        >
                                            {t("Anfrage stornieren")}
                                        </NewButton>
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
