import { useCallback, useEffect, useRef } from "react";
import { notEmpty } from "../util/TypeUtil";
import useDelayedCallback from "./useDelayedCallback";
import "json.date-extensions";

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
        load();
    }, []);

    useEffect(() => {
        if (firstRender.current) return;
        persist();
    }, [object, firstRender]);

    const load = () => {
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
            const parseAgainWithDates = (JSON.parseWithDate(
                item
            ) as unknown) as T;
            console.log(`loaded "${key}" to local-storage`);
            onLoad?.(parseAgainWithDates);
        } catch (e) {
            console.error(e);
            // delete invalid reservation item
            localStorage.removeItem(key);
        }
    };

    const persistImmediate = useCallback(() => {
        console.log(`saved "${key}" to local-storage`);
        localStorage.setItem(key, JSON.stringify(object));
    }, [key, object]);
    const persist = useDelayedCallback(() => persistImmediate(), 1000);

}
