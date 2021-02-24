import { useRouter } from "next/router";
import { useState, useCallback, ReactNode, useEffect } from "react";
import { appUrls } from "../../config";
import { TransitionDirection } from "../../src/model/AppState";
import { useAppState } from "../common/AppStateProvider";
import { LayoutProps } from "../common/Layout";
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
    const {appState, dispatch} = useAppState();
    const direction = appState.subPageTransitionDirection;

    const setActiveSubPage = useCallback((subPage?: SubPagesType, param?: string) => {
        const url = appUrls.requestSubpage(subPage as string, param);
        router.push(url, url, {
            shallow: true,
        });
    }, []);

    const setDirection = useCallback((_direction: TransitionDirection) => {
        dispatch({
            type: "subPageTransitionDirection",
            direction: _direction,
        });
    }, []);

    const subPageProps: (
        subpage: SubPagesType,
        returnToSubPage?: SubPagesType
    ) => Omit<SubPageProps, "title" | "children"> = useCallback(
        (subpage: SubPagesType, returnToSubPage?: SubPagesType) => ({
            active: activeSubPage === subpage,
            onBack: (nextSubPage?: SubPagesType) => {
                setDirection("left");
                setActiveSubPage(nextSubPage || returnToSubPage);
            },
        }),
        [activeSubPage, setActiveSubPage, setDirection]
    );

    const goForward = (subpage: SubPagesType) => {
        setDirection("right");
        setActiveSubPage(subpage);
    }

    const goBack = (subpage: SubPagesType) => {
        setDirection("left");
        setActiveSubPage(subpage);
    }

    const handlerProps = useCallback(
        (nextSubPage: SubPagesType) => ({
            onClick: (param?: string) => {
                const p = typeof param === "string" ? param : undefined;
                setDirection("right");
                setActiveSubPage(nextSubPage, p);
            },
        }),
        [activeSubPage, setActiveSubPage]
    );

    return {
        activeSubPage,
        direction,
        subPageProps,
        handlerProps,
        goForward,
        goBack
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
