import React, { useCallback, useEffect, useRef, useState } from "react";
import { use100vh } from "react-div-100vh";
import { requestSubpages } from "../../../config";
import { useTranslation } from "../../../localization";
import useReservationState from "../../../src/hooks/useReservation";
import useResources from "../../../src/hooks/useResources";
import Resource from "../../../src/model/api/Resource";
import { empty } from "../../../src/util/TypeUtil";
import theme from "../../../styles/theme";
import useSubPage from "../../api/useSubPage";
import LazyList from "../../common/LazyList";
import { LoadingInline } from "../../common/Loading";
import ResourceListItem, {
    LoadingListItem,
} from "../../common/ResourceListItem";

interface ResourceListSubPageProps {}

const ResourceListSubPage: React.FunctionComponent<ResourceListSubPageProps> = ({}) => {
    const { t } = useTranslation();
    const r = useResources(true);
    const [itemCount, setItemCount] = useState(0);
    const [selectedResourceId, setSelectedResourceId] = useReservationState(
        "resource_uuid"
    );
    const height = (use100vh() || 500) - theme.topBarHeight;

    // load initial resources
    useEffect(() => {
        r.requestResources(undefined, 0, 20);
    }, []);

    const handleResourceSelect = useCallback((resourceId: string) => {
        const handle = (selected?: boolean) => {
            if (selected) {
                setSelectedResourceId(resourceId);
            } else {
                setSelectedResourceId(undefined);
            }
        };

        return handle;
    }, []);

    const isSelected = (resourceId: string) =>
        resourceId === selectedResourceId;

    // update has next page
    useEffect(() => {
        if (r.state === "success") {
            const { dataCount } = r.additionalData;
            if (empty(dataCount)) return;
            setItemCount(dataCount);
        }
    }, [r.state]);

    const loadMore = async (from: number, to: number) => {
        await r.requestResources(undefined, from, to - from + 1);
        return null;
    };

    return (
        <>
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
                        onSelect={handleResourceSelect(item.uuid)}
                        last={last}
                    />
                )}
            </LazyList>
        </>
    );
};

export default ResourceListSubPage;
