import { route } from "next/dist/next-server/server/router";
import { useRouter } from "next/router";
import { useState, useCallback, ReactNode, useEffect } from "react";
import { LayoutProps, TransitionDirection } from "../common/Layout";
import { SubPageProps } from "../common/SubPage";

type DepthMapEntry = {};
type SubPagesMapType = Record<string, DepthMapEntry>;

// const activeSubPageFromRoute (route: string)

const useSubPage = <SubPagesMap extends SubPagesMapType>(
    subPagesMap: SubPagesMap
) => {
    type SubPagesType = keyof SubPagesMap;
    const router = useRouter();

    const activeSubPage = Object.keys(router.query)[0];
    const setActiveSubPage = (subPage?: SubPagesType) =>
        router.push(`/request${`/?${subPage || "s"}`}`, undefined, {
            shallow: true,
        });

    const [direction, setDirection] = useState<TransitionDirection>("left");
    // register router events
    useEffect(() => {
        const changeHandler = (route: string, e) => {
            // console.log("event", route, e)
        }
        router.events.on("routeChangeStart", changeHandler);
        return () => {
            router.events.off("routeChangeStart", changeHandler)
        }
    }, []);

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
