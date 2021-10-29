import { NextPage, GetStaticProps, GetStaticPaths } from "next";
import { useRouter } from "next/router";
import React, { useCallback } from "react";
import { use100vh } from "react-div-100vh";
import {
    getResourcesRequest,
    getUnitsRequest,
} from "../../../components/api/ApiService";
import DynamicList from "../../../components/common/DynamicList";
import Layout from "../../../components/common/Layout";
import ResourceListItem from "../../../components/common/ResourceListItem";
import SubPageBar from "../../../components/common/SubPageBar";
import { appUrls } from "../../../config";
import { useTranslation } from "../../../localization";
import useResourceListItemHeight from "../../../src/hooks/useResourceListItemHeight";
import useTheme from "../../../src/hooks/useTheme";
import Resource from "../../../src/model/api/Resource";

type ResourceListPageProps = {
    resources: Resource[];
};

const ResourceListPage: NextPage<ResourceListPageProps> = ({ resources }) => {
    const { t } = useTranslation("room");
    const theme = useTheme();
    const height = (use100vh() || 500) - theme.topBarHeight();
    const listItemHeight = useResourceListItemHeight();
    const router = useRouter();
    

    const handleResourceSelect = useCallback(
        ({ name, uuid, unit }: Resource) => {
            const handle = () => {
                const [url, as] = appUrls.resource(
                    unit.slug,
                    uuid,
                    name
                );
                router.push(url, as);
            };

            return handle;
        },
        [router]
    );

    return (
        <>
            <style jsx>{``}</style>
            <Layout
                title={t("Raumliste")}
                noContentMargin
                overrideHeader={<SubPageBar title="Raumliste" />}
                overrideActionButton={() => null}
            >
                <DynamicList
                    height={height}
                    items={resources}
                    itemCount={resources.length}
                    itemSize={listItemHeight}
                >
                    {(resource, last) => (
                        <ResourceListItem
                            // selected={isSelected(resource.uuid)}
                            resource={resource}
                            onClick={handleResourceSelect(resource)}
                            last={last}
                            showMeta
                            includeAlternativeNames
                        />
                    )}
                </DynamicList>
            </Layout>
        </>
    );
};

type ResourceListPageParams = {
    unitslug: string;
};

export const getStaticPaths: GetStaticPaths<ResourceListPageParams> =
    async () => {
        const { data: units, error } = await getUnitsRequest();
        if (!units) throw Error(error);
        const paths = units?.map((unit) => ({
            params: {
                unitslug: unit.slug,
            },
        }));
        return {
            paths,
            fallback: false,
        };
    };

export const getStaticProps: GetStaticProps<
    ResourceListPageProps,
    ResourceListPageParams
> = async ({params}) => {
    if (!params?.unitslug) {
        return {
            notFound: true
        }
    }
    const { data: resources, error } = await getResourcesRequest({
        requestParameters: {
            unit: params?.unitslug
        }
    });
    if (!resources) throw Error(error);
    return {
        props: {
            resources,
        },
    };
};
export default ResourceListPage;
