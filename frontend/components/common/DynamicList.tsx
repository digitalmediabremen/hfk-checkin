import React, {
    forwardRef,
    MutableRefObject,
    PropsWithChildren,
    ReactElement,
    ReactNode,
} from "react";
import {
    FixedSizeList,
    FixedSizeList as List,
    FixedSizeListProps,
} from "react-window";
import css from "styled-jsx/css";
import { empty } from "../../src/util/TypeUtil";

interface DynamicListProps<T>
    extends Omit<
        FixedSizeListProps,
        "children" | "width" | "innerTypeElement"
    > {
    // children: (item: T, last: boolean) => ReactNode;
    loadingComponent?: ReactElement;
    items: Array<T | null>;
    children: (item: T, last: boolean) => ReactNode;
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

declare module "react" {
    function forwardRef<T, P = {}>(
        render: (props: P, ref: RefPropType<T>) => React.ReactElement | null
    ): (props: P & React.RefAttributes<T>) => React.ReactElement | null;
}

type RefPropType<T> =
    | ((instance: T | null) => void)
    | MutableRefObject<T | null>
    | null;

const DynamicList = <T extends {}>(
    {
        items,
        loadingComponent,
        children,
        itemCount,
        ...fixedSizedListProps
    }: PropsWithChildren<DynamicListProps<T>>,
    ref: RefPropType<FixedSizeList>
) => {
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
            if (!loadingComponent) {
                content = null;
            } else {
                content = React.cloneElement(loadingComponent, { index });
            }
        } else {
            content = children(item, index === itemCount - 1);
        }

        return <div style={style}>{content}</div>;
    };
    return (
        <>
            <style jsx>{``}</style>
            <List
                innerElementType="ul"
                className={className}
                width="100%"
                itemCount={itemCount}
                {...fixedSizedListProps}
                ref={ref}
            >
                {Item}
            </List>
        </>
    );
};

const DynamicListWithRef = forwardRef(DynamicList);

export default DynamicListWithRef;
