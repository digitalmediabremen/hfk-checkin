import React, { useCallback, useEffect, useState } from "react";
import { use100vh } from "react-div-100vh";
import { useTranslation } from "../../../localization";
import useParam from "../../../src/hooks/useParam";
import useReservationState from "../../../src/hooks/useReservationState";
import useResources from "../../../src/hooks/useResources";
import Resource from "../../../src/model/api/Resource";
import { empty } from "../../../src/util/TypeUtil";
import theme from "../../../styles/theme";
import LazyList from "../../common/LazyList";
import Loading from "../../common/Loading";
import ResourceListItem, {
    LoadingListItem
} from "../../common/ResourceListItem";

interface ResourceListSubPageProps {}

const ResourceListSubPage: React.FunctionComponent<ResourceListSubPageProps> = ({}) => {
    const r = useResources(true);
    const [itemCount, setItemCount] = useState(0);
    const [selectedResource, setSelectedResource] = useReservationState(
        "resource"
    );
    const resourceId = useParam("resource-list")[0] || "";
    const height = (use100vh() || 500) - theme.topBarHeight;
    const [loaded, setLoaded] = useState(false);

    // load initial resources
    useEffect(() => {
        (async () => {
            await r.requestResources(resourceId, undefined, 0, 20);
            setLoaded(true);
    })()
    }, []);

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

    // update has next page
    useEffect(() => {
        if (r.state === "success") {
            const { dataCount } = r.additionalData;
            if (empty(dataCount)) return;
            setItemCount(dataCount);
        }
    }, [r.state]);

    const loadMore = async (from: number, to: number) => {
        await r.requestResources(resourceId, undefined, from, to - from + 1);
        return null;
    };

    if (!resourceId) return null;
    return (
        <Loading loading={!loaded}>
            <style jsx>{``}</style>
            <LazyList
                height={height}
                itemHeight={theme.spacing(7) + 1}
                itemCount={itemCount}
                items={r.result || []}
                loadingComponent={<LoadingListItem />}
                loadNextPage={loadMore}
            >
                {(item, last) => (
                    <ResourceListItem
                        selected={isSelected(item.uuid)}
                        resource={item}
                        onSelect={handleResourceSelect(item)}
                        last={last}
                        showMeta
                    />
                )}
            </LazyList>
        </Loading>
    );
};

export default ResourceListSubPage;
