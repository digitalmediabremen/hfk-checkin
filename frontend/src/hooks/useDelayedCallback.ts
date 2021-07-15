import { useRef, useEffect, useState } from "react";

export default function useDelayedCallback<T extends unknown[]>(
    callback: (...value: T) => void,
    delay: number
) {
    const [value, setValue] = useState<number>();
    const timerId = useRef<number>();
    const [param, setParam] = useState<T>([] as unknown as T);
    useEffect(() => {
        if (!value) return;
        timerId.current = window.setTimeout(() => callback(...param), delay);
        return () => {
            if (timerId.current) window.clearTimeout(timerId.current);
        };
    }, [value, param]);

    const update = (...value: T) => {
        setValue(Math.random());
        setParam(value)
    };

    return update;
}
