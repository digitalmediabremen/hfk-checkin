import { useState, useCallback, ReactNode } from "react";
import { LayoutProps, TransitionDirection } from "../common/Layout";
import { SubPageProps } from "../common/SubPage";

type ExcludeArray<T> = T extends Array<unknown> ? never : T;
type DepthMapEntry<T> = number | [number, keyof ExcludeArray<T>];
type DepthMapType<T> = Record<string, DepthMapEntry<T>>;

const useSubPage = <SubPagesType extends DepthMapType<SubPagesType>>(
    depthMap: SubPagesType
) => {
    const getDepth = (entry: DepthMapEntry<SubPagesType>): number => {
        if (Array.isArray(entry)) {
            const [depth] = entry;
            return depth;
        }
        return entry;
    };

    const getNextSubPage = (
        entry: DepthMapEntry<SubPagesType>
    ): undefined | keyof SubPagesType => {
        if (Array.isArray(entry)) {
            const [, subpage] = entry;
            return subpage as keyof SubPagesType;
        }
        return undefined;
    };

    const [activeSubPage, setActiveSubPage] = useState<
        keyof SubPagesType | undefined
    >();

    const [direction, setDirection] = useState<TransitionDirection>("left");

    const subPageProps: (
        subpage: keyof SubPagesType
    ) => Omit<SubPageProps, "title" | "children"> = useCallback(
        (subpage: keyof SubPagesType) => ({
            active: activeSubPage === subpage,
            onBack: (nextSubPage?: keyof SubPagesType) => {
                setActiveSubPage(nextSubPage);
                setDirection("left");
            }
        }),
        [activeSubPage]
    );

    const handlerProps = useCallback(
        (nextSubPage: keyof SubPagesType) => ({
            onClick: () => {
                setDirection("right");
                setActiveSubPage(nextSubPage);
            },
        }),
        [activeSubPage]
    );

    const pageProps: () => Partial<LayoutProps> = useCallback(
        () => ({
            activeSubPage: activeSubPage as string,
            direction: direction,
        }),
        [direction, activeSubPage]
    );

    return {
        activeSubPage,
        subPageProps,
        pageProps,
        handlerProps,
    };
};

export default useSubPage;

// set next active subpage

// layout reads depth value from active subpage otherwise zero

// layout does animation

// when animation done

// subpage is active

// subpage will leave
//
