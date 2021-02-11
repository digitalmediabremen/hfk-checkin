import dynamic from "next/dynamic";
import React, { ReactNode, useCallback, useState } from "react";
import needsProfile from "../components/api/needsProfile";
import showIf from "../components/api/showIf";
import useSubPage from "../components/api/useSubPage";
import FormElement from "../components/common/FormElement";
import FormElementWithSubpage from "../components/common/FormElementWithSubpage";
import { Input } from "../components/common/Input";
import { LoadingScreen } from "../components/common/Loading";
import Layout from "../components/common/Page";
import SubPage from "../components/common/SubPage";
import Title from "../components/common/Title";
import { appUrls } from "../config";
import features from "../features";
import { useTranslation } from "../localization";

const DynamicComponent = dynamic(
    () => import("../components/help/HelpContent-de"),
    {
        loading: () => <LoadingScreen />,
        ssr: false,
    }
);

type SubPagesType = "zeit" | "raum" | "personen" | "grund" | "nachricht";

const RequestRoomPage = () => {
    const { t } = useTranslation();
    const {
        subPageProps,
        pageProps
    } = useSubPage<SubPagesType>();
    return (
        <Layout {...pageProps()}>
            <style jsx>{``}</style>
            <div>
                <FormElementWithSubpage
                    {...subPageProps("zeit", () => <DynamicComponent />)}
                    subPageTitle={t("Zeit eingeben")}
                    // value={["Hallo", "Welt"]}
                    label={t("Zeit")}
                    shortLabel={t("Zeit")}
                />
                <FormElementWithSubpage
                    {...subPageProps("raum", () => <DynamicComponent />)}
                    subPageTitle={t("Raum auswählen")}
                    value={["erste Zeile", "zweite Zeile"]}
                    label={t("Raum")}
                />
                <FormElementWithSubpage
                    {...subPageProps("personen", () => <DynamicComponent />)}
                    subPageTitle={t("Personen hinzufügen")}
                    // value={["erste Zeile", "zweite Zeile"]}
                    label={t("Personen")}
                    shortLabel={t("Pers.")}
                />
                <FormElementWithSubpage
                    {...subPageProps("grund", () => <DynamicComponent />)}
                    subPageTitle={t("Buchungsgrund")}
                    value={["erste Zeile", "zweite Zeile", "dritte Zeile"]}
                    label={t("Buchungsgrund")}
                    shortLabel={t("Grund")}
                />
                <FormElementWithSubpage
                    {...subPageProps("nachricht", () => <DynamicComponent />)}
                    subPageTitle={t("Nachricht")}
                    value={["erste Zeile", "zweite Zeile"]}
                    label={t("Nachricht")}
                    shortLabel={t("Nach.")}
                />
            </div>
        </Layout>
    );
};

export default showIf(() => features.getin, needsProfile(RequestRoomPage));
