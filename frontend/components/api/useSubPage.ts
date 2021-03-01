import { useRouter } from "next/router";
import { useState, useCallback, ReactNode, useEffect, useRef } from "react";
import { appUrls } from "../../config";
import { TransitionDirection } from "../../src/model/AppState";
import { notEmpty } from "../../src/util/TypeUtil";
import { useAppState } from "../common/AppStateProvider";
import { LayoutProps } from "../common/Layout";
import { SubPageProps } from "../common/SubPage";

export type UseSubPageConfig = {
    readonly subpages: Record<string, {}>;
    urlProvider: (subpageName?: string, param?: string) => string;
};

export function buildSubPageUrl(base: string, subPage?: string, param?: string) {
    let url = base;
    if (notEmpty(subPage)) url = `${url}?${subPage}`;
    if (notEmpty(param)) url = `${url}=${param}`;
    return url;
}

const useSubPage = <SubPagesMap extends Record<string, {}>>({
    urlProvider,
}: UseSubPageConfig) => {
    type SubPagesType = keyof SubPagesMap;
    const router = useRouter();
    const activeSubPage = Object.keys(router.query)[0];
    const { appState, dispatch } = useAppState();
    const direction = appState.subPageTransitionDirection;

    const setActiveSubPage = useCallback(
        (subPage?: SubPagesType, param?: string) => {
            const url = urlProvider(subPage as string | undefined, param);
            router.push(url, url, {
                shallow: true,
            });
        },
        [urlProvider]
    );

    const setDirection = useCallback((_direction: TransitionDirection) => {
        dispatch({
            type: "subPageTransitionDirection",
            direction: _direction,
        });
    }, []);

    const subPageProps = useCallback(
        (subpage: SubPagesType, returnToSubPage?: SubPagesType) => {
            return {
                active: subpage === activeSubPage,
                onBack: (nextSubPage?: SubPagesType) => {
                    setDirection("left");
                    setActiveSubPage(nextSubPage || returnToSubPage);
                },
            };
        },
        []
    );

    const goForward = (subpage: SubPagesType, param?: string) => {
        const p = typeof param === "string" ? param : undefined;
        setDirection("right");
        setActiveSubPage(subpage, p);
    };

    const goBack = (subpage: SubPagesType, param?: string) => {
        const p = typeof param === "string" ? param : undefined;
        setDirection("left");
        setActiveSubPage(subpage, p);
    };

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
        goBack,
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
