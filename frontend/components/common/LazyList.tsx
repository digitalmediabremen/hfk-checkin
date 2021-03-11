import React, { PropsWithChildren, ReactNode, useRef } from "react";
import { FixedSizeList as List } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import css from "styled-jsx/css";
import { empty, notEmpty } from "../../src/util/TypeUtil";
import useTheme from "../../src/hooks/useTheme";
interface LazyListProps<T> {
    // Are we currently loading a page of items?
    // (This may be an in-flight flag in your Redux store for example.)
    // Array of items loaded so far.
    items: Array<T | null>;

    // Callback function responsible for loading the next page of items.
    loadNextPage: (
        startIndex: number,
        stopIndex: number
    ) => Promise<void | null>;

    children: (item: T, last: boolean) => ReactNode;
    loadingComponent: ReactNode;

    height: number;
    itemHeight: number;
    itemCount: number;
}

const { className, styles } = css.resolve`
    div > :global(ul) {
        margin: 0;
        padding: 0;
    }

    overflow-y: auto !important;
    overflow-x: hidden !important;

    ::-webkit-scrollbar {
        display: none;
    }
`;

const LazyList = <T extends {}>({
    items,
    loadNextPage,
    children,
    loadingComponent,
    height,
    itemHeight,
    itemCount,
}: PropsWithChildren<LazyListProps<T>>) => {
    const theme = useTheme();
    // Only load 1 page of items at a time.
    // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
    const nextHighestOffset = useRef(-1);

    const loadMoreItems = async (from: number, to: number) => {
        if (from < nextHighestOffset.current) {
            return null;
        }
        nextHighestOffset.current = to;
        return loadNextPage(from, to);
    };

    // Every row is loaded except for our loading indicator row.
    const isItemLoaded = (index: number) => notEmpty(items[index]);

    // Render an item or a loading indicator.
    const Item = ({
        index,
        style,
    }: {
        index: number;
        style: React.CSSProperties;
    }) => {
        let content;
        const item = items[index];
        if (empty(item)) {
            content = loadingComponent;
        } else {
            content = children(item, index === itemCount - 1);
        }

        return <div style={style}>{content}</div>;
    };

    return (
        <>
            <InfiniteLoader
                isItemLoaded={isItemLoaded}
                itemCount={itemCount}
                loadMoreItems={loadMoreItems}
                minimumBatchSize={10}
            >
                {({ onItemsRendered, ref }) => (
                    <List
                        innerElementType="ul"
                        className={className}
                        height={height}
                        itemCount={itemCount}
                        itemSize={itemHeight}
                        onItemsRendered={onItemsRendered}
                        ref={ref}
                        width="100%"
                    >
                        {Item}
                    </List>
                )}
            </InfiniteLoader>
            {styles}
        </>
    );
};

export default LazyList;
