import { useRef, useEffect, useState } from "react";

export default function useDelayedCallback(
    callback: () => void,
    delay: number
) {
    const [value, setValue] = useState<number>();
    const timerId = useRef<number>();
    useEffect(() => {
        if (!value) return;
        timerId.current = window.setTimeout(() => callback(), delay);
        return () => {
            if (timerId.current) window.clearTimeout(timerId.current);
        };
    }, [value]);

    const update = () => {
        setValue(Math.random());
    };

    return update;
}
