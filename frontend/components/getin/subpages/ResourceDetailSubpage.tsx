import React, { useEffect } from "react";
import { appUrls, buildSubPageUrl } from "../../../config";
import { useTranslation } from "../../../localization";
import useResource from "../../../src/hooks/useResource";
import { useResourceFormValuePresenter } from "../../../src/util/ReservationPresenterUtil";
import useSubPage from "../../api/useSubPage";
import AlignContent from "../../common/AlignContent";
import FormElement from "../../common/FormElement";
import Loading from "../../common/Loading";
import NewButton from "../../common/NewButton";
import SectionTitle from "../../common/SectionTitle";
import SubPage from "../../common/SubPage";

interface ResourceDetailSubpageProps {}

export const DETAIL_SUBPAGE_ID = "detail";

const ResourceDetailSubpage: React.FunctionComponent<ResourceDetailSubpageProps> =
    () => {
        const { subPageProps, activeSubPageParam: resourceId } = useSubPage({
            urlProvider: (name, param) =>
                buildSubPageUrl(appUrls.room, name, param),
        });
        const { t } = useTranslation("room");
        const api = useResource();
        const resourceFormValuePresenter = useResourceFormValuePresenter();

        // request resource
        useEffect(() => {
            if (!resourceId) return;
            api.request(resourceId);
        }, [resourceId]);

        const title = api.result
            ? resourceFormValuePresenter(api.result)[1]
            : t("Raum");

        const featureList = api.result?.features?.join(", ");

        const handleCreateRequest = () => {};

        return (
            <>
                <style jsx>{``}</style>
                <SubPage title={title} {...subPageProps(DETAIL_SUBPAGE_ID)}>
                    <Loading loading={api.state === "loading"}>
                        {api.state === "success" && (
                            <>
                                <FormElement
                                    labelIcon="NR"
                                    value={
                                        resourceFormValuePresenter(
                                            api.result
                                        )[0]
                                    }
                                    density="super-narrow"
                                    bottomSpacing={2}
                                    noOutline
                                    noPadding
                                />
                                <SectionTitle noMarginBottom>
                                    {t("Verantwortlicher")}
                                </SectionTitle>
                                <FormElement
                                    density="super-narrow"
                                    noOutline
                                    noPadding
                                    value={["Herr Blabla"]}
                                    bottomSpacing={2}
                                />

                                <SectionTitle bottomSpacing={0.5}>
                                    {t("Ausstattung")}
                                </SectionTitle>
                                <FormElement
                                    density="super-narrow"
                                    noOutline
                                    noPadding
                                    maxRows={2}
                                    value={[
                                        featureList ||
                                            "Testfeature List, sdfsd, Hallo, Bette, Was geht",
                                    ]}
                                    bottomSpacing={2}
                                />
                                <AlignContent align="bottom" noFooter>
                                    <div style={{ width: "100%" }}>
                                        <NewButton>
                                            {t("Raum anfragen")}
                                        </NewButton>
                                        <NewButton>
                                            {t("Schliessberechtigung anfragen")}
                                        </NewButton>
                                    </div>
                                </AlignContent>
                            </>
                        )}
                    </Loading>
                </SubPage>
            </>
        );
    };

export default ResourceDetailSubpage;
