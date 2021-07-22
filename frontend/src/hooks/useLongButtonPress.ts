import { useCallback, useEffect, useRef, useState } from "react";
import useDelayedCallback from "./useDelayedCallback";

export default function useLongButtonPress(
    normalClickHandler: () => void,
    longClickHandler: () => void,
    clickRate: number = 200
) {
    const pressed = useRef(false);
    const interval = useRef<number | null>(null);
    const callbackRef = useRef(longClickHandler);

    useEffect(() => {
        callbackRef.current = longClickHandler;
    }, [longClickHandler]);

    useEffect(() => {
        return () => {
            if (interval.current) window.clearInterval(interval.current);
        };
    }, []);

    const cb = useDelayedCallback(() => {
        if (pressed.current === false) return;
        callbackRef.current();
        interval.current = window.setInterval(
            () => callbackRef.current(),
            clickRate
        );
    }, 200);

    const _onMouseDown = () => {
        if (interval.current) window.clearInterval(interval.current);

        pressed.current = true;
        cb();
    };

    const _onMouseUp = (triggerNormalClick = true) => {
        if (pressed.current === false) return;
        pressed.current = false;

        if (interval.current === null) {
            if (triggerNormalClick) {
                normalClickHandler();
            }
        } else {
            window.clearInterval(interval.current);
            interval.current = null;
        }
    };

    function onPointerDown(event: React.PointerEvent<any>) {
        _onMouseDown();
    }

    function onPointerUp(event: React.PointerEvent<any>) {
        _onMouseUp();
    }

    function onPointerCancel(event: React.PointerEvent<any>) {
        _onMouseUp(false);
    }

    function onPointerLeave(event: React.PointerEvent<any>) {
        _onMouseUp(false);
    }

    function onPointerOut(event: React.PointerEvent<any>) {
        _onMouseUp(false);
    }

    function onContextMenu(event: React.MouseEvent<any>) {
        event.preventDefault();
    }

    return {
        onPointerDown,
        onPointerUp,
        onPointerCancel,
        onPointerOut,
        onPointerLeave,
        onContextMenu,
    };
}
