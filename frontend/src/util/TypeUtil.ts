export function empty<TValue>(
    value: TValue | null | undefined
): value is null | undefined {
    return value === null || value === undefined;
}

export function notEmpty<TValue>(
    value: TValue | null | undefined
): value is TValue {
    return !empty(value);
}

/**
 * A typeguard to be used in places when a value is known to be set but the typescript compiler can't infer it.
 * @param  {TValue|null|undefined} value
 * the value to check
 * @param  {string} [error]
 * a exception message thrown when value is empty
 */
export function assertNotEmpty<TValue>(
    value: TValue | null | undefined,
    error?: string
): asserts value is TValue {
    if (!notEmpty(value)) throw new Error(error || "value is empty");
}

type tm = {
    "number": number,
    "object": object,
    "string": string,
}

export function assert(t: boolean) {
    if (!t) throw "assertion failed"
}

type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends <
    T
>() => T extends Y ? 1 : 2
    ? A
    : B;

export type WritableKeys<T> = {
    [P in keyof T]-?: IfEquals<
        { [Q in P]: T[P] },
        { -readonly [Q in P]: T[P] },
        P
    >;
}[keyof T];

export type Writable<T> = Pick<T, WritableKeys<T>>; 

