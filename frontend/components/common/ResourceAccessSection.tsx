import { useRouter } from "next/router";
import React from "react";
import { ArrowRight } from "react-feather";
import { appUrls, buildSubPageUrl } from "../../config";
import { useTranslation } from "../../localization";
import useReservationState from "../../src/hooks/useReservationState";
import useTheme from "../../src/hooks/useTheme";
import Resource from "../../src/model/api/Resource";
import { resourcePermissionIcon } from "../../src/util/ReservationPresenterUtil";
import useSubPage from "../api/useSubPage";
import AlignContent, { AvailableHeight } from "./AlignContent";
import Divider from "./Divider";
import FormGroup from "./FormGroup";
import FormText from "./FormText";
import NewButton from "./NewButton";
import Notice from "./Notice";
import ResourceCalendar from "./ResourceCalendar";
import SectionTitle from "./SectionTitle";
import SubPage from "./SubPage";

interface ResourceAccessSectionProps {
    resource: Resource;
    sectionSpacing: number;
    onShowCalendar: () => void;
}

const ResourceAccessSection: React.FunctionComponent<ResourceAccessSectionProps> =
    ({ resource, sectionSpacing, onShowCalendar }) => {
        const { t } = useTranslation("resource");
        const showReservationButton = resource.reservable;
        const PermissionIcon = resourcePermissionIcon(resource);
        const [, setResource] = useReservationState("resource");
        const router = useRouter();
        const theme = useTheme();

        const handleClickRequestResource = () => {
            setResource(resource);
            router.push(appUrls.request);
        };

        return (
            <>
                <style jsx>{``}</style>
                <SectionTitle bottomSpacing={sectionSpacing}>
                    {t("Zugang")}
                </SectionTitle>
                <FormGroup>
                    {resource.access_restricted && (
                        <FormText>
                            <PermissionIcon
                                strokeWidth={(2 / 20) * 24}
                                height={"1.111em"}
                                width={"1em"}
                                preserveAspectRatio="none"
                                style={{
                                    verticalAlign: "text-bottom",
                                    transform: "translateY(-2px)",
                                }}
                            />{" "}
                            {t("Dieser Raum ist zugangsbeschränkt.")}
                        </FormText>
                    )}
                    {!resource.reservable && (
                        <FormText>
                            {t(
                                "Dieser Raum ist nicht über Getin reservierbar."
                            )}
                        </FormText>
                    )}
                </FormGroup>
                {showReservationButton && (
                    <NewButton
                        noOutline
                        density="super-narrow"
                        bottomSpacing={2}
                        iconRight={<ArrowRight />}
                        onClick={handleClickRequestResource}
                    >
                        {t("Raum anfragen")}
                    </NewButton>
                )}
                {resource.reservable && (
                    <>
                        <Divider />
                        <SectionTitle bottomSpacing={sectionSpacing}>
                            {t("Verfügbarkeit")}
                        </SectionTitle>

                        {!theme.isDesktop ? (
                            <>
                                <NewButton
                                    noOutline
                                    density="super-narrow"
                                    bottomSpacing={2}
                                    iconRight={<ArrowRight />}
                                    onClick={onShowCalendar}
                                >
                                    {t("Kalender öffnen")}
                                </NewButton>
                                {/* <Notice>
                                    Füge den Ical Link zu deinem Kalender hinzu
                                </Notice> */}
                            </>
                        ) : (
                            <ResourceCalendar resource={resource} />
                        )}
                    </>
                )}
            </>
        );
    };

export default ResourceAccessSection;
