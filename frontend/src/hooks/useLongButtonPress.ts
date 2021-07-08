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

    const cb = useDelayedCallback(() => {
        if (pressed.current === false) return;
        interval.current = window.setInterval(() => callbackRef.current(), clickRate);
    }, 200);

    const onMouseDown = (event: React.MouseEvent<any, MouseEvent>) => {
        if (interval.current) window.clearInterval(interval.current);

        pressed.current = true;
        cb();
    };

    useEffect(() => {
        return () => {
            if (interval.current) window.clearInterval(interval.current);
        };
    }, []);

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

    function onMouseOut(event: React.MouseEvent<any, MouseEvent>) {
        _onMouseUp(false);
    }

    function onMouseUp(event: React.MouseEvent<any, MouseEvent>) {
        _onMouseUp();
    }

    function onBlur(event: React.FocusEvent<any>) {
        _onMouseUp(false);
    }

    return { onMouseDown, onMouseUp, onMouseOut, onBlur };
}
