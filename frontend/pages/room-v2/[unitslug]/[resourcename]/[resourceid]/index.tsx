import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { useRouter } from "next/router";
import React, { FunctionComponent } from "react";
import {
    getResourceRequest,
    getResourcesRequest,
} from "../../../../../components/api/ApiService";
import useSubPage, {
    useSubPageWithState,
} from "../../../../../components/api/useSubPage";
import Divider from "../../../../../components/common/Divider";
import FormElement from "../../../../../components/common/FormElement";
import FormGroup from "../../../../../components/common/FormGroup";
import FormText from "../../../../../components/common/FormText";
import Layout from "../../../../../components/common/Layout";
import ResourceAccessSection from "../../../../../components/common/ResourceAccessSection";
import ResourceCalendar from "../../../../../components/common/ResourceCalendar";
import SectionTitle from "../../../../../components/common/SectionTitle";
import SubPage from "../../../../../components/common/SubPage";
import SubPageBar from "../../../../../components/common/SubPageBar";
import { appUrls } from "../../../../../config";
import { useTranslation } from "../../../../../localization";
import useTheme from "../../../../../src/hooks/useTheme";
import Resource from "../../../../../src/model/api/Resource";
import { useResourceFormValuePresenter } from "../../../../../src/util/ReservationPresenterUtil";
import { notEmpty } from "../../../../../src/util/TypeUtil";

type ResourcePageProps = {
    resource: Resource;
};

const ResourcePage: NextPage<ResourcePageProps> = ({ resource }) => {
    const { t } = useTranslation("room");
    const router = useRouter();
    const featureList = resource.features?.join(", ");
    const delegatesList = resource.access_delegates?.join(", ");
    const title = resource.unit.name;
    const resourceFormValuePresenter = useResourceFormValuePresenter();
    const theme = useTheme();

    const { handlerProps, activeSubPage, subPageProps, direction } =
        useSubPageWithState(theme.isDesktop ? () => undefined : undefined);

    const handleBack = () => {
        const [url, as] = appUrls.resourceList(resource.unit.slug);
        router.push(url, as);
    };

    const handleCalendarSubpageClick = () => {
        handlerProps("calendar").onClick();
    };

    const sectionSpacing = 0.5;

    return (
        <>
            <style jsx>{``}</style>
            <Layout
                direction={direction}
                subPages={
                    <SubPage
                        title="KalendarAnsicht"
                        {...subPageProps("calendar")}
                    >
                        <ResourceCalendar />
                    </SubPage>
                }
                activeSubPage={activeSubPage}
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

                <FormGroup sameLine>
                    {resource.capacity && (
                        <>
                            <SectionTitle bottomSpacing={sectionSpacing}>
                                {t("Kapazität")}
                            </SectionTitle>
                            <FormText bottomSpacing={2}>
                                {t("{capacity} Personen", {
                                    capacity: `${resource.capacity}`,
                                })}
                            </FormText>
                        </>
                    )}

                    {resource.area && (
                        <>
                            <SectionTitle bottomSpacing={sectionSpacing}>
                                {t("Fläche")}
                            </SectionTitle>
                            <FormText bottomSpacing={2}>
                                {t("{area}m²", {
                                    area: `${resource.area}`,
                                })}
                            </FormText>
                        </>
                    )}

                    {notEmpty(resource.floor_number) && (
                        <>
                            <SectionTitle bottomSpacing={sectionSpacing}>
                                {t("Etage")}
                            </SectionTitle>
                            <FormText bottomSpacing={2}>
                                {resource.floor_number + 1}
                            </FormText>
                        </>
                    )}
                </FormGroup>
                {featureList && (
                    <>
                        <SectionTitle bottomSpacing={sectionSpacing}>
                            {t("Ausstattung")}
                        </SectionTitle>
                        <FormText bottomSpacing={2}>{featureList}</FormText>
                    </>
                )}
                {delegatesList && (
                    <>
                        <SectionTitle bottomSpacing={sectionSpacing}>
                            {t("Verantwortliche")}
                        </SectionTitle>
                        <FormText bottomSpacing={2}>{delegatesList}</FormText>
                    </>
                )}
                <Divider />
                <ResourceAccessSection
                    resource={resource}
                    sectionSpacing={sectionSpacing}
                    onShowCalendar={handleCalendarSubpageClick}
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
