import { TypeFormatFlags } from "ts-morph";
import Reservation from "../model/api/Reservation";

export function empty<TValue>(
    value: TValue | null | undefined
): value is null | undefined {
    return value === null || value === undefined;
}

export function notEmpty<TValue>(
    value: TValue | null | undefined
): value is NonNullable<TValue> {
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
    number: number;
    object: object;
    string: string;
};

export function assertNever(t: never, errorMessage: string): never {
    throw new Error(errorMessage);
}

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer I>
        ? Array<DeepPartial<I>>
        : DeepPartial<T[P]>;
};

type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends <
    T
>() => T extends Y ? 1 : 2
    ? A
    : B;

export type NonNullableWritableKeys<K> = WritableKeys<NonNullable<K>>;

type CopyOptional<ForKeys extends string | number | symbol, O> = {
    [K in keyof O]: K extends ForKeys
        ? K extends keyof O
            ? O[K]
            : never
        : never;
};

export type WritableKeys<T> = {
    [P in keyof T]-?: IfEquals<
        { [Q in P]: T[P] },
        { -readonly [Q in P]: T[P] },
        P
    >;
}[keyof T];

type Without<T, V, WithNevers = {
  [K in keyof T]: Exclude<T[K], undefined> extends V ? never 
  : (T[K] extends Record<string, unknown> ? Without<T[K], V> : T[K])
}> = Pick<WithNevers, {
  [K in keyof WithNevers]: WithNevers[K] extends never ? never : K
}[keyof WithNevers]>

export type Writable<T extends {} | undefined> = Without<CopyOptional<
    WritableKeys<NonNullable<T>>,
    NonNullable<T>
>, never>;

export type DeepWritable<T> = Writable<
    {
        [P in keyof T]: T[P] extends Array<infer I> | undefined
            ? Array<DeepWritable<I>>
            : T[P] extends Record<string, unknown> | undefined
            ? DeepWritable<T[P]>
            : T[P];
    }
>;

export type RemoveNull<T> = Exclude<T, null>;

export type DeepRemoveNull<T> = {
    [P in keyof T]: RemoveNull<
        T[P] extends Array<infer I>
            ? Array<DeepRemoveNull<I>>
            : T[P] extends Record<string, unknown>
            ? DeepRemoveNull<T[P]>
            : T[P]
    >;
};
