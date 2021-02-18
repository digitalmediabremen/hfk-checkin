import { useState, useCallback, ReactNode } from "react";
import { LayoutProps, TransitionDirection } from "../common/Layout";
import { SubPageProps } from "../common/SubPage";

type DepthMapEntry = {};
type SubPagesMapType = Record<string, DepthMapEntry>;

const useSubPage = <SubPagesMap extends SubPagesMapType>(
    subPagesMap: SubPagesMap
) => {
    type SubPagesType = keyof SubPagesMap;
    const [activeSubPage, setActiveSubPage] = useState<
        SubPagesType | undefined
    >();

    const [direction, setDirection] = useState<TransitionDirection>("left");

    const subPageProps: (
        subpage: SubPagesType,
        returnToSubPage?: SubPagesType
    ) => Omit<SubPageProps, "title" | "children"> = useCallback(
        (subpage: SubPagesType, returnToSubPage?: SubPagesType) => ({
            active: activeSubPage === subpage,
            onBack: (nextSubPage?: SubPagesType) => {
                setActiveSubPage(nextSubPage || returnToSubPage);
                setDirection("left");
            },
        }),
        [activeSubPage]
    );

    const handlerProps = useCallback(
        (nextSubPage: SubPagesType) => ({
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
