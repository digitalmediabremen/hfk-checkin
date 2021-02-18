import dynamic from "next/dynamic";
import React from "react";
import needsProfile from "../components/api/needsProfile";
import showIf from "../components/api/showIf";
import useSubPage from "../components/api/useSubPage";
import { Button } from "../components/common/Button";
import FormElement from "../components/common/FormElement";
import FormElementWithSubpage from "../components/common/FormElementWithSubpage";
import Layout from "../components/common/Layout";
import { LoadingScreen } from "../components/common/Loading";
import SubPage from "../components/common/SubPage";
import features from "../features";
import { useTranslation } from "../localization";

const createDynamicPage = (func: () => any) =>
    dynamic(func, {
        loading: () => <LoadingScreen />,
        ssr: false,
    });

const SetTimeSubpage = createDynamicPage(
    () => import("../components/getin/subpages/SetTimeSubpage")
);

const SetRoomSubpage = createDynamicPage(
    () => import("../components/getin/subpages/SetRoomSubpage")
);

const SetPersonSubpage = createDynamicPage(
    () => import("../components/getin/subpages/SetPersonSubpage")
);

const RequestRoomPage = () => {
    const { t } = useTranslation();
    const { subPageProps, pageProps, handlerProps } = useSubPage({
        zeit: 1,
        raum: 1,
        personen: [2, "raum"],
        grund: 1,
        nachricht: 1,
    });

    return (
        <Layout {...pageProps()} subPages={<>
            <SubPage title={t("Zeit festlegen")} {...subPageProps("zeit")}>
                {() => <SetTimeSubpage />}
            </SubPage>
            <SubPage title={t("Raum auswählen")} {...subPageProps("raum")}>
                {() => <SetRoomSubpage />}
            </SubPage>
            <SubPage
                title={t("Personen hinzufügen")}
                {...subPageProps("personen")}
            >
                {() => <SetPersonSubpage />}
            </SubPage>
            <SubPage
                title={t("Personen hinzufügen")}
                {...subPageProps("personen")}
            >
                {() => <SetPersonSubpage />}
            </SubPage>
            <SubPage title={t("Grund angeben")} {...subPageProps("grund")}>
                {() => <SetTimeSubpage />}
            </SubPage>
            <SubPage title={t("Nachricht")} {...subPageProps("nachricht")}>
                {() => <SetTimeSubpage />}
            </SubPage>
        </>}>
            <style jsx>{``}</style>
            <div>
                <FormElement
                    {...handlerProps("zeit")}
                    label={t("Zeitangaben tätigen")}
                    shortLabel={t("Zeit")}
                    arrow
                />
                <FormElement
                    {...handlerProps("raum")}
                    value={["erste Zeile", "zweite Zeile"]}
                    label={t("Raum")}
                />
                <FormElement
                    {...handlerProps("personen")}
                    value="Leonard Puhl"
                    label={t("Personen")}
                    shortLabel={t("Pers.")}
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
                />
                <FormElement
                    {...handlerProps("nachricht")}
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

export default showIf(() => features.getin, RequestRoomPage);
