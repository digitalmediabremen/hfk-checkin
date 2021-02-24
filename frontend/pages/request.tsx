import { NextPage } from "next";
import dynamic from "next/dynamic";
import React from "react";
import { ConstructorDeclaration } from "ts-morph";
import { useProfile } from "../components/api/ApiHooks";
import needsProfile from "../components/api/needsProfile";
import showIf from "../components/api/showIf";
import useSubPage from "../components/api/useSubPage";
import { useAppState } from "../components/common/AppStateProvider";
import { Button } from "../components/common/Button";
import FormCheckbox from "../components/common/FormCheckbox";
import FormElement from "../components/common/FormElement";
import FormElementBase from "../components/common/FormElementBase";
import Layout from "../components/common/Layout";
import { LoadingScreen } from "../components/common/Loading";
import NewButton from "../components/common/NewButton";
import Notice from "../components/common/Notice";
import SubPage from "../components/common/SubPage";
import { SetPersonSubpageProps } from "../components/getin/subpages/SetPersonSubpage";
import { requestSubpages } from "../config";

import features from "../features";
import { useTranslation } from "../localization";
import useReservationState, {
    useReservation,
    useReservationArrayState,
} from "../src/hooks/useReservation";
import NewReservation from "../src/model/api/NewReservation";
import Profile from "../src/model/api/Profile";
import {
    createTime,
    fromTime,
    getFormattedDate,
    smallerThan,
} from "../src/util/DateTimeUtil";

const createDynamicPage = <T extends {}>(func: () => any) =>
    (dynamic(func, {
        loading: () => <LoadingScreen />,
        ssr: false,
    }) as unknown) as React.ComponentType<T>;

const DynamicSetTimeSubpage = createDynamicPage(
    () => import("../components/getin/subpages/SetTimeSubpage")
);

const DynamicSetRoomSubpage = createDynamicPage(
    () => import("../components/getin/subpages/SetRoomSubpage")
);

const DynamicSetPersonSubpage = createDynamicPage<SetPersonSubpageProps>(
    () => import("../components/getin/subpages/SetPersonSubpage")
);

const DynamicAddExternalPersonSubpage = createDynamicPage(
    () => import("../components/getin/subpages/AddExternalPersonSubPage")
);

const presentTimeLabel = (start?: Date, end?: Date): string[] | undefined => {
    if (!start || !end) return undefined;
    const overlap = smallerThan(
        createTime(end.getHours(), end.getMinutes()),        
        createTime(start.getHours(), start.getMinutes()),

    );
    return [
        getFormattedDate(start, "de") || "",
        `${fromTime(start)} — ${fromTime(end)} ${overlap ? "+1 Tag" : ""}`,
    ];
};

const RequestRoomPage: NextPage<{ profile: Profile }> = ({ profile }) => {
    const { t } = useTranslation();
    const { subPageProps, handlerProps, direction, activeSubPage } = useSubPage(
        requestSubpages
    );

    const {
        attendees,
        number_of_extra_attendees: extraAttendees,
        start,
        end,
    } = useReservation();

    return (
        <Layout
            direction={direction}
            activeSubPage={activeSubPage}
            subPages={
                <>
                    <SubPage
                        title={t("Zeit festlegen")}
                        {...subPageProps("zeit")}
                    >
                        {() => <DynamicSetTimeSubpage />}
                    </SubPage>
                    <SubPage
                        title={t("Raum auswählen")}
                        {...subPageProps("raum")}
                    >
                        {() => <DynamicSetRoomSubpage />}
                    </SubPage>
                    <SubPage
                        title={t("Personen hinzufügen")}
                        {...subPageProps("personen")}
                    >
                        {() => (
                            <DynamicSetPersonSubpage
                                onAddExternalPerson={
                                    handlerProps("add-person").onClick
                                }
                            />
                        )}
                    </SubPage>
                    <SubPage
                        title={t("Externe hinzufügen")}
                        {...subPageProps("add-person", "personen")}
                    >
                        {() => <DynamicAddExternalPersonSubpage />}
                    </SubPage>
                    <SubPage
                        title={t("Grund angeben")}
                        {...subPageProps("grund")}
                    >
                        {() => <DynamicSetTimeSubpage />}
                    </SubPage>
                    <SubPage
                        title={t("Nachricht")}
                        {...subPageProps("nachricht")}
                    >
                        {() => <DynamicSetTimeSubpage />}
                    </SubPage>
                </>
            }
        >
            <style jsx>{``}</style>
            <div>
                <FormElement
                    {...handlerProps("raum")}
                    value={["erste Zeile", "zweite Zeile"]}
                    label={t("Raum")}
                    arrow
                    extendedWidth
                />
                <FormElement
                    {...handlerProps("zeit")}
                    label={t("Zeitangaben tätigen")}
                    value={presentTimeLabel(start, end)}
                    shortLabel={t("Zeit")}
                    arrow
                    extendedWidth
                />
                <FormElement
                    {...handlerProps("personen")}
                    value={[
                        ...(attendees?.map(
                            (a) => `${a.first_name} ${a.last_name} (Extern)`
                        ) || []),
                        `+${(extraAttendees || 0) + 1} weitere`,
                    ]}
                    label={t("Personen")}
                    shortLabel={t("Pers.")}
                    arrow
                    extendedWidth
                />
                <FormElement
                    {...handlerProps("grund")}
                    value={[
                        "erste Zeile die auch sehr lang ist und nervt.",
                        "zweite Zeile",
                        "dritte Zeile",
                    ]}
                    label={t("Buchungsgrund")}
                    shortLabel={t("Grund")}
                    arrow
                    extendedWidth
                />
                <FormElement
                    {...handlerProps("nachricht")}
                    value={["erste Zeile", "zweite Zeile"]}
                    label={t("Nachricht")}
                    shortLabel={t("Nach.")}
                    bottomSpacing={1}
                    arrow
                    extendedWidth
                />
                <FormCheckbox
                    extendedWidth
                    small
                    value={false}
                    label={t(
                        "Bitte ruft mich bei Rückfragen zu dieser Buchung unter {phone} zurück.",
                        { phone: profile?.phone }
                    )}
                    bottomSpacing={3}
                />
                <NewButton primary onClick={() => {}}>
                    {t("Anfragen")}
                </NewButton>
            </div>
        </Layout>
    );
};

export default showIf(() => features.getin, RequestRoomPage);
