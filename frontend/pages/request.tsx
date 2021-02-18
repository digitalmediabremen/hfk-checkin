import dynamic from "next/dynamic";
import React from "react";
import showIf from "../components/api/showIf";
import useSubPage from "../components/api/useSubPage";
import { Button } from "../components/common/Button";
import FormElement from "../components/common/FormElement";
import Layout from "../components/common/Layout";
import { LoadingScreen } from "../components/common/Loading";
import SubPage from "../components/common/SubPage";
import { SetPersonSubpageProps } from "../components/getin/subpages/SetPersonSubpage";

import features from "../features";
import { useTranslation } from "../localization";

const createDynamicPage = <
    T extends {}
>(
    func: () => any
) =>
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

const RequestRoomPage = () => {
    const { t } = useTranslation();
    const { subPageProps, pageProps, handlerProps } = useSubPage({
        zeit: {},
        raum: {},
        personen: {},
        grund: {},
        nachricht: {},
    });

    return (
        <Layout
            {...pageProps()}
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
                                onAddExternalPerson={() => {}}
                            />
                        )}
                    </SubPage>
                    <SubPage
                        title={t("Personen hinzufügen")}
                        {...subPageProps("personen")}
                    >
                        {() => (
                            <DynamicSetPersonSubpage
                                onAddExternalPerson={handlerProps("grund").onClick}
                            />
                        )}
                    </SubPage>
                    <SubPage
                        title={t("Grund angeben")}
                        {...subPageProps("grund", "personen")}
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
