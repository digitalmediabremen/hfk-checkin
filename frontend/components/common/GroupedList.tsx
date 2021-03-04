import React, {
    Fragment,
    PropsWithChildren,
    ReactElement,
    ReactNode,
    useMemo,
} from "react";
import { insertIf } from "../../src/util/ReservationUtil";

interface GroupedListProps<ElemType> {
    items: ElemType[];
    children: (item: ElemType, last: boolean) => ReactNode;
    by: (item: ElemType) => string;
    headerProvider: (h: string, firstItem: ElemType) => ReactElement | null;
    sort?: (a: ElemType, b: ElemType) => number;
}

// both render functions dont update state
const GroupedList = <ET extends {}>({
    items: _items,
    by,
    headerProvider,
    sort,
    children,
}: PropsWithChildren<GroupedListProps<ET>>) => {
    const processedItems = useMemo(
        () =>
            // sort and group items
            (sort!! ? _items.sort(sort) : _items).reduce<Record<string, ET[]>>(
                (groups, elem) => {
                    const groupKey = by(elem);
                    const currentGroup = groups?.[groupKey] || [];
                    return {
                        ...groups,
                        [groupKey]: [...currentGroup, elem],
                    };
                },
                {}
            ),
        [_items, by, sort]
    );

    const renderedItems = useMemo(
        () =>
            Object.entries<ET[]>(processedItems)
                .map(([groupKey, items]) => [
                    // call the groupheader render function
                    <Fragment key={groupKey}>
                        {headerProvider(groupKey, items?.[0])}
                    </Fragment>,
                    items.map((item, itemIndex, items) => (
                        // call the children render function
                        <Fragment key={`${groupKey}-${itemIndex}`}>
                            {children(item, items.length - 1 === itemIndex)}
                        </Fragment>
                    )),
                ])
                .flat(2),
        [_items, by, sort]
    );
    return (
        <>
            <style jsx>{``}</style>
            {renderedItems}
        </>
    );
};

export default GroupedList;
