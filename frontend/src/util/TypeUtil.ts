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
