import { useCallback, useEffect, useRef, useState } from "react";
import { notEmpty } from "../util/TypeUtil";
import useDelayedCallback from "./useDelayedCallback";
import "json.date-extensions";
import { ColorScheme } from "../model/Theme";

export function loadItemFromLocalStorage<T extends Object>(
    key: string,
    validateObject?: (o: any) => T
) {
    if (typeof localStorage === "undefined") return undefined;
    try {
        // todo: fix
        // parse ones without dates
        const item = localStorage.getItem(key);

        if (!item) {
            console.debug(`no item for key "${key}"`);
            return;
        }

        const check = JSON.parse(item) as unknown;
        validateObject?.(check);
        // @ts-ignore
        const parseAgainWithDates = JSON.parseWithDate(item) as unknown as T;
        console.debug(`loaded "${key}" from local-storage`);
        return parseAgainWithDates;
    } catch (e) {
        console.error(e);
        // delete invalid reservation item
        localStorage.removeItem(key);
    }
}

export function useReadLocalStorage<T extends Object>(
    key: string,
    validateObject?: (o: any) => T
) {
    const [item, setItem] = useState<T>();

    useEffect(
        () => setItem(loadItemFromLocalStorage(key, validateObject)),
        [key, validateObject]
    );

    return item;
}

export default function useLocalStorage<T extends Object>(
    key: string,
    object: T | undefined,
    validateObject?: (o: any) => T,
    onLoad?: (object: T) => void
) {
    const firstRender = useRef(true);

    const updateFirstRender = useDelayedCallback(
        () => (firstRender.current = false),
        1000
    );

    useEffect(() => {
        updateFirstRender();
        if (!!onLoad) load();
    }, []);

    useEffect(() => {
        if (firstRender.current) return;
        persist();
    }, [object, firstRender]);

    const load = useCallback(() => {
        const r = loadItemFromLocalStorage(key, validateObject);
        if (r) onLoad?.(r);
    }, [key, validateObject]);

    const persistImmediate = useCallback(() => {
        console.debug(`saved "${key}" to local-storage`);
        localStorage.setItem(key, JSON.stringify(object));
    }, [key, object]);
    const persist = useDelayedCallback(() => persistImmediate(), 1000);
}
