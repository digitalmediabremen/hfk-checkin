import dynamic from "next/dynamic";
import React from "react";
import needsProfile from "../components/api/needsProfile";
import showIf from "../components/api/showIf";
import useSubPage from "../components/api/useSubPage";
import { Button } from "../components/common/Button";
import FormElementWithSubpage from "../components/common/FormElementWithSubpage";
import Layout from "../components/common/Layout";
import { LoadingScreen } from "../components/common/Loading";
import features from "../features";
import { useTranslation } from "../localization";

const SetTimeSubpage = dynamic(
    () => import("../components/getin/subpages/SetTimeSubpage"),
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
                    {...subPageProps("zeit", () => <SetTimeSubpage />)}
                    subPageTitle={t("Zeit eingeben")}
                    // value={["Hallo", "Welt"]}
                    label={t("Zeitangaben tätigen")}
                    shortLabel={t("Zeit")}
                />
                <FormElementWithSubpage
                    {...subPageProps("raum", () => <DynamicComponent />)}
                    subPageTitle={t("Raum auswählen")}
                    value={["erste Zeile", "zweite Zeile"]}
                    label={t("Raum")}
                />
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate necessitatibus adipisci velit sit iusto blanditiis aliquam nostrum facilis in mollitia. Adipisci, ducimus soluta. Atque ut officia hic nam, qui eaque. Lorem ipsum dolor sit amet consectetur adipisicing elit. Possimus, enim alias? Nesciunt assumenda ad nulla? Delectus ducimus, ad incidunt nulla, repudiandae quisquam dolores, magnam modi similique neque id a fugit!
                <FormElementWithSubpage
                    {...subPageProps("personen", () => <DynamicComponent />)}
                    subPageTitle={t("Personen hinzufügen")}
                    value="Leonard Puhl"
                    label={t("Personen")}
                    shortLabel={t("Pers.")}
                />
                <FormElementWithSubpage
                    {...subPageProps("grund", () => <DynamicComponent />)}
                    subPageTitle={t("Buchungsgrund")}
                    value={["erste Zeile die auch sehr lang ist und nervt.", "zweite Zeile", "dritte Zeile"]}
                    label={t("Buchungsgrund")}
                    shortLabel={t("Grund")}
                />
                <FormElementWithSubpage
                    {...subPageProps("nachricht", () => <DynamicComponent />)}
                    subPageTitle={t("Nachricht")}
                    value={["erste Zeile", "zweite Zeile"]}
                    label={t("Nachricht")}
                    shortLabel={t("Nach.")}
                    bottomSpacing={2}
                />
                <Button onClick={() => {}}>Submit</Button>
            </div>
        </Layout>
    );
};

export default showIf(() => features.getin, (RequestRoomPage));
