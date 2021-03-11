import dynamic from "next/dynamic";
import React, { Fragment, memo, useMemo } from "react";
import { requestSubpages } from "../../../config";
import { useTranslation } from "../../../localization";
import useSubPage from "../../api/useSubPage";
import { LoadingScreen } from "../../common/Loading";
import SubPage from "../../common/SubPage";
import { SetPersonSubpageProps } from "./AddAttendeesSubpage";

interface SubpageListProps {}

export const createDynamicPage = <T extends {}>(func: () => any) =>
    (dynamic(func, {
        loading: () => <LoadingScreen key="loading" />,
        ssr: false,
    }) as unknown) as React.ComponentType<T>;

const DynamicSetTimeSubpage = createDynamicPage(
    () => import("./SetTimeSubpage")
);

const DynamicSetRoomSubpage = createDynamicPage(
    () => import("./SelectResourceSubPage")
);

const DynamicSetPersonSubpage = createDynamicPage<SetPersonSubpageProps>(
    () => import("./AddAttendeesSubpage")
);

const DynamicAddExternalPersonSubpage = createDynamicPage(
    () => import("./AddExternalPersonSubPage")
);

const DynamicResourceListSubpage = createDynamicPage(
    () => import("./ResourceListSubPage")
);

const DynamicSetPurposeSubPage = createDynamicPage(
    () => import("./SetPurposeSubPage")
);

const DynamicSetCommentSubpage = createDynamicPage(
    () => import("./SetCommentSubpage")
);

const SubpageList: React.FunctionComponent<SubpageListProps> = ({
    
}) => {
    const { subPageProps } = useSubPage(requestSubpages);
    const { t } = useTranslation("request");
    return (
        <Fragment>
            <SubPage title={t("Datum und Uhrzeit")} {...subPageProps("time")}>
                {() => <DynamicSetTimeSubpage />}
            </SubPage>
            <SubPage title={t("Raum")} {...subPageProps("resource")}>
                {() => <DynamicSetRoomSubpage />}
            </SubPage>
            <SubPage
                title={t("Externe Personen")}
                {...subPageProps("attendees")}
            >
                {() => <DynamicSetPersonSubpage />}
            </SubPage>
            <SubPage
                title={t("Person hinzufügen")}
                {...subPageProps("attendee-set", "attendees")}
            >
                {() => <DynamicAddExternalPersonSubpage />}
            </SubPage>
            <SubPage title={t("Buchungsgrund")} {...subPageProps("purpose")}>
                {() => <DynamicSetPurposeSubPage />}
            </SubPage>
            <SubPage title={t("Nachricht")} {...subPageProps("message")}>
                {() => <DynamicSetCommentSubpage />}
            </SubPage>
            <SubPage
                noContentMargin
                title={t("Raumliste")}
                {...subPageProps("resource-list", "resource")}
            >
                {() => <DynamicResourceListSubpage />}
            </SubPage>
        </Fragment>
    );
};

export default SubpageList;
