import { useRouter } from "next/router";
import { useCallback, useRef, useState } from "react";
import { TransitionDirection } from "../../src/model/AppState";
import { notEmpty } from "../../src/util/TypeUtil";
import { useAppState } from "../common/AppStateProvider";

export type UseSubPageConfig = {
    urlProvider: (subpageName?: string, param?: string) => string;
};

export type SubPageState = {
    activeSubPage: string;
    activeSubPageParam: string | undefined;
};

export const useSubPageWithState = (
    overwriteSubPageState?: (() => SubPageState | undefined)
) => {
    const [activeSubPage, _setActiveSubPage] = useState<SubPageState>();

    const { appState, dispatch } = useAppState();
    const direction = appState.subPageTransitionDirection;

    const getActiveSubpage = () =>
        notEmpty(overwriteSubPageState)
            ? overwriteSubPageState()
            : activeSubPage;

    const setActiveSubPage = useCallback(
        (subPage?: string, param?: string) => {
            if (!subPage) {
                _setActiveSubPage(undefined);
            } else {
                _setActiveSubPage({
                    activeSubPage: subPage,
                    activeSubPageParam: param,
                });
            }
        },
        [activeSubPage]
    );

    const setDirection = useCallback((_direction: TransitionDirection) => {
        console.log(_direction);
        dispatch({
            type: "subPageTransitionDirection",
            direction: _direction,
        });
    }, []);

    const subPageProps = useCallback(
        (subpage: string, returnToSubPage?: string) => {
            return {
                active: subpage === getActiveSubpage()?.activeSubPage,
                onBack: (nextSubPage?: string) => {
                    setDirection("left");
                    setActiveSubPage(nextSubPage || returnToSubPage);
                },
            };
        },
        [activeSubPage, getActiveSubpage]
    );

    const goForward = (subpage: string, param?: string) => {
        const p = typeof param === "string" ? param : undefined;
        setDirection("right");
        setActiveSubPage(subpage, p);
    };

    const goBack = (subpage: string, param?: string) => {
        const p = typeof param === "string" ? param : undefined;
        setDirection("left");
        setActiveSubPage(subpage, p);
    };

    const handlerProps = useCallback(
        (nextSubPage: string) => ({
            onClick: (param?: string) => {
                const p = typeof param === "string" ? param : undefined;
                setDirection("right");
                setActiveSubPage(nextSubPage, p);
            },
        }),
        []
    );

    return {
        activeSubPage: getActiveSubpage()?.activeSubPage,
        activeSubPageParam: getActiveSubpage()?.activeSubPageParam,
        direction,
        subPageProps,
        handlerProps,
        goForward,
        goBack,
    };
};

const useSubPage = <SubPagesMap extends Record<string, {}>>({
    urlProvider,
}: UseSubPageConfig) => {
    type SubPagesType = keyof SubPagesMap;
    const router = useRouter();
    const activeSubPage = Object.keys(router.query)[0];
    const activeSubPageParam = Object.values(router.query)[0] as string;

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
        activeSubPageParam,
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
