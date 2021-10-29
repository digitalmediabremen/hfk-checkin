import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import {
    getResourceRequest,
    getResourcesRequest,
} from "../../../../../components/api/ApiService";
import FormElement from "../../../../../components/common/FormElement";
import Layout from "../../../../../components/common/Layout";
import SectionTitle from "../../../../../components/common/SectionTitle";
import SubPageBar from "../../../../../components/common/SubPageBar";
import Title from "../../../../../components/common/Title";
import { appUrls } from "../../../../../config";
import { useTranslation } from "../../../../../localization";
import useTheme from "../../../../../src/hooks/useTheme";
import Resource from "../../../../../src/model/api/Resource";
import { useResourceFormValuePresenter } from "../../../../../src/util/ReservationPresenterUtil";

type ResourcePageProps = {
    resource: Resource;
};

const ResourcePage: NextPage<ResourcePageProps> = ({ resource }) => {
    const { t } = useTranslation("room");
    const theme = useTheme();
    const router = useRouter();
    const featureList = resource.features?.join(", ");
    const delegatesList = resource.access_delegates?.join(", ");
    const title = resource.unit.name;
    const resourceFormValuePresenter = useResourceFormValuePresenter();

    const handleBack = () => {
        const [url, as] = appUrls.resourceList(resource.unit.slug);
        router.push(url, as);
    };

    return (
        <>
            <style jsx>{``}</style>
            <Layout
                title={resource.display_name}
                // noContentMargin
                overrideHeader={
                    <SubPageBar onBack={handleBack} title={title} />
                }
                overrideActionButton={() => null}
            >
                <FormElement
                    value={resourceFormValuePresenter(resource)}
                    density="super-narrow"
                    bottomSpacing={2}
                    noOutline
                    noPadding
                />
                {delegatesList && (
                    <>
                        <SectionTitle noMarginBottom>
                            {t("Verantwortliche")}
                        </SectionTitle>
                        <FormText
                            bottomSpacing={2}
                        >{delegatesList</FormText>
                    </>
                )}

                {featureList && (
                    <>
                        <SectionTitle bottomSpacing={0.5}>
                            {t("Ausstattung")}
                        </SectionTitle>
                        <FormElement
                            density="super-narrow"
                            noOutline
                            noPadding
                            maxRows={2}
                            value={[featureList]}
                            bottomSpacing={2}
                        />
                    </>
                )}

                <SectionTitle noMarginBottom>
                    {t("Zugang")}
                </SectionTitle>
                <FormElement
                    density="super-narrow"
                    noOutline
                    noPadding
                    value={[delegatesList]}
                    bottomSpacing={2}
                />
            </Layout>
        </>
    );
};

type ResourcePageParams = {
    unitslug: string;
    resourceid: string;
    resourcename: string;
};

export const getStaticProps: GetStaticProps<
    ResourcePageProps,
    ResourcePageParams
> = async ({ params }) => {
    if (!params?.resourceid)
        return {
            notFound: true,
        };

    const { data: resource, error } = await getResourceRequest(
        params.resourceid
    );

    if (!resource)
        return {
            notFound: true,
        };

    return {
        props: {
            resource,
        },
    };
};

export const getStaticPaths: GetStaticPaths<ResourcePageParams> = async (
    context
) => {
    const { data: resources, error } = await getResourcesRequest();
    if (!resources) throw Error(error);
    const paths = resources?.map((resource) => ({
        params: {
            unitslug: resource.unit.slug,
            resourcename: resource.name,
            resourceid: resource.uuid,
        },
    }));
    return {
        paths,
        fallback: false,
    };
};

export default ResourcePage;
