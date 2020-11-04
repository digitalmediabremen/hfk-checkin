import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

export const useDelayedLongButtonPress = (
    time: number,
    clickHandler: () => void
) => {
    const timerId = useRef<number | undefined>(undefined);
    const [isLongPress, setLongPress] = useState<boolean>(false);

    const pressStart = () => {
        // event for same chance didnt fire clear anyway
        if (timerId.current) window.clearTimeout(timerId.current);
        setLongPress(false);
        timerId.current = window.setTimeout(() => setLongPress(true), time);
    };

    const pressEnd = () => {
        window.clearTimeout(timerId.current);
        // if toggle==false then treat as normal click
        if (isLongPress === false) clickHandler();
        setLongPress(false);
    };

    // if comp unmounts during button press
    useEffect(() => clearTimeout(timerId.current), []);

    return {
        pressStart,
        pressEnd,
        isLongPress,
    };
};
