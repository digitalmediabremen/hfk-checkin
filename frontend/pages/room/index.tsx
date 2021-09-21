import { useRouter } from "next/router";
import React from "react";
import { use100vh } from "react-div-100vh";
import useSubPage from "../../components/api/useSubPage";
import Layout from "../../components/common/Layout";
import ResourceList from "../../components/common/ResourceList";
import ResourceListItem from "../../components/common/ResourceListItem";
import SubPageBar from "../../components/common/SubPageBar";
import ResourceDetailSubpage, { DETAIL_SUBPAGE_ID } from "../../components/getin/subpages/ResourceDetailSubpage";
import { appUrls, buildSubPageUrl } from "../../config";
import { useTranslation } from "../../localization";
import useTheme from "../../src/hooks/useTheme";

interface indexProps {}


const RoomPage: React.FunctionComponent<indexProps> = ({}) => {
    const { t } = useTranslation("room");
    const theme = useTheme();
    const height = (use100vh() || 500) - theme.topBarHeight();
    const router = useRouter();

    const { direction, activeSubPage, handlerProps } = useSubPage(
        {
            urlProvider: (name, param) =>
                buildSubPageUrl(appUrls.room, name, param),
        }
    );

    return (
        <>
            <style jsx>{``}</style>
            <Layout
                title={t("Raumliste")}
                noContentMargin
                direction={direction}
                activeSubPage={activeSubPage}
                overrideHeader={<SubPageBar title="Raumliste" />}
                overrideActionButton={() => null}
                subPages={
                    <>
                        <ResourceDetailSubpage
                            // resourceId={selectedResourceId}
                        />
                    </>
                }
            >
                <ResourceList height={height} unitSlug={"xi"}>
                    {(resource, last) => (
                        <ResourceListItem
                            resource={resource}
                            last={last}
                            // showMeta
                            includeAlternativeNames
                            onClick={() => handlerProps(DETAIL_SUBPAGE_ID).onClick(resource.uuid)}
                        />
                    )}
                </ResourceList>
            </Layout>
        </>
    );
};

export default RoomPage;
