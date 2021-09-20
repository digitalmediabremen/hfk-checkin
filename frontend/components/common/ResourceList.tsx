import React, { ReactNode, useEffect, useState } from "react";
import useResources from "../../src/hooks/useResources";
import useTheme from "../../src/hooks/useTheme";
import Resource from "../../src/model/api/Resource";
import { empty } from "../../src/util/TypeUtil";
import { calculateMinHeightSpacing } from "./FormElementBase";
import LazyList from "./LazyList";
import Loading from "./Loading";
import {
    LoadingListItem, RESOURCE_LIST_ITEM_DENSITY
} from "./ResourceListItem";

interface ResourceListProps {
    unitSlug: string;
    height: number;
    children: (resource: Resource, last: boolean) => ReactNode;
}

const ResourceList: React.FunctionComponent<ResourceListProps> = ({
    unitSlug,
    height,
    children
}) => {
    const theme = useTheme();
    const r = useResources(true);
    const [itemCount, setItemCount] = useState(0);
    const [loaded, setLoaded] = useState(false);

    // load initial resources
    useEffect(() => {
        (async () => {
            await r.requestResources(unitSlug, undefined, 0, 20);
            setLoaded(true);
        })();
    }, []);

    // update has next page
    useEffect(() => {
        if (r.state === "success") {
            const { dataCount } = r.additionalData;
            if (empty(dataCount)) return;
            setItemCount(dataCount);
        }
    }, [r.state]);

    const loadMore = async (from: number, to: number) => {
        await r.requestResources(unitSlug, undefined, from, to - from + 1);
        return null;
    };

    const listItemHeight =
        theme.spacing(calculateMinHeightSpacing(RESOURCE_LIST_ITEM_DENSITY)) +
        1;

    if (!unitSlug) return null;
    return (
        <Loading loading={!loaded}>
            <style jsx>{``}</style>
            <LazyList
                height={height}
                itemHeight={listItemHeight}
                itemCount={itemCount}
                items={r.result || []}
                loadingComponent={<LoadingListItem />}
                loadNextPage={loadMore}
            >
                {children}
            </LazyList>
        </Loading>
    );
};

export default ResourceList;
