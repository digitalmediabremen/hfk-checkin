import React, { useCallback } from "react";
import { use100vh } from "react-div-100vh";
import useParam from "../../../src/hooks/useParam";
import useReservationState from "../../../src/hooks/useReservationState";
import useTheme from "../../../src/hooks/useTheme";
import Resource from "../../../src/model/api/Resource";
import ResourceList from "../../common/ResourceList";
import ResourceListItem from "../../common/ResourceListItem";

interface ResourceListSubPageProps {}

const ResourceListSubPage: React.FunctionComponent<ResourceListSubPageProps> =
    ({}) => {
        const theme = useTheme();
        const [selectedResource, setSelectedResource] =
            useReservationState("resource");
        const unitSlug = useParam("resource-list")[0] || "";
        const height = (use100vh() || 500) - theme.topBarHeight();

        const handleResourceSelect = useCallback((resource: Resource) => {
            const handle = (selected?: boolean) => {
                if (selected) {
                    setSelectedResource(resource);
                } else {
                    setSelectedResource(undefined);
                }
            };

            return handle;
        }, []);

        const isSelected = (resourceId: string) =>
            resourceId === selectedResource?.uuid;

        if (!unitSlug) return null;
        return (
            <ResourceList height={height} unitSlug={unitSlug}>
                {(resource, last) => (
                    <ResourceListItem
                        selected={isSelected(resource.uuid)}
                        resource={resource}
                        onSelect={handleResourceSelect(resource)}
                        last={last}
                        showMeta
                        includeAlternativeNames
                    />
                )}
            </ResourceList>
        );
    };

export default ResourceListSubPage;
