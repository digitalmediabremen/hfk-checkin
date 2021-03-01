import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import { ArrayLiteralExpression } from "ts-morph";
import { useAppState } from "../../components/common/AppStateProvider";
import NewReservation from "../model/api/NewReservation";
import validate from "../model/api/NewReservation.validator";
import NewReservationBlueprint from "../model/api/NewReservationBlueprint";
import Reservation from "../model/api/Reservation";
import { empty, notEmpty } from "../util/TypeUtil";
import useParam from "./useParam";

type ModifierFunction<I, O> = (value: I) => O;

type ConditionalReturnType<RF, WF, ApiDataType> = readonly [
    RF extends ModifierFunction<infer I, infer O> ? O : ApiDataType,
    WF extends ModifierFunction<infer I, infer O>
        ? (value: I) => void
        : (value: ApiDataType) => void
];

// type IfOrElse<Cond, Thi, Tha> = Cond extends undefined

export function useReservationRequest() {
    const { appState } = useAppState();
    const reservationFromAppstate = appState.reservationRequest || {};

    const _validate = () => {
        try {
            // unset resource
            // we dont want to submit it
            const data: NewReservationBlueprint = {
                ...reservationFromAppstate,
                resource: undefined,
            };
            const reservationDateStrings = JSON.parse(JSON.stringify(data));
            validate(reservationDateStrings);
            return data as NewReservation;
        } catch (e) {
            throw e;
        }
    };

    return { reservation: reservationFromAppstate, validateModel: _validate };
}

export default function useReservationState<
    ReservationFieldType extends Exclude<
        keyof NewReservationBlueprint,
        undefined
    >
>(field: ReservationFieldType) {
    const { appState, dispatch } = useAppState();
    const reservation = appState.reservationRequest;
    const value = appState.reservationRequest?.[field];
    const setHandler = useCallback(
        (value: NewReservationBlueprint[ReservationFieldType]) => {
            console.log(`reservation mutation: [${field}]:`, value);
            dispatch({
                type: "updateReservationRequest",
                reservation: {
                    ...reservation,
                    [field]: value,
                },
            });
        },
        [reservation]
    );

    return [value, setHandler] as const;
}

type ArrayOnly<T> = {
    [K in keyof T as T[K] extends Array<infer S> | undefined ? K : never]: T[K];
};

type test = keyof ArrayOnly<NewReservationBlueprint>;

export const useSubpageQuery = <
    ReservationFieldType extends keyof NewReservationBlueprint
>() => {
    const router = useRouter();
    const q = Object.values(router.query)?.[0];
    const qq = Array.isArray(q) ? q[0] : q;

    const i = notEmpty(qq) && qq !== "" ? parseInt(qq) : undefined;
    const [index, setIndex] = useState(i || 0);
    useEffect(() => {
        if (notEmpty(i)) setIndex(i);
    }, [i]);
    return index;
};

type ExtractTypeFromArray<
    ArrayType extends Array<unknown> | undefined
> = ArrayType extends Array<infer T> ? T : never;

export const useReservationArrayState = <
    ReservatonFieldType extends keyof ArrayOnly<NewReservationBlueprint>
>(
    key: ReservatonFieldType
) => {
    const [_arrayValue, setArrayValue] = useReservationState(key);
    const arrayValue = notEmpty(_arrayValue) ? _arrayValue : [];

    const handleAddValue = (
        value: ExtractTypeFromArray<
            NewReservationBlueprint[ReservatonFieldType]
        >,
        index: number
    ) => {
        if (empty(value)) return;
        arrayValue[index] = value;
        console.debug("arr", arrayValue);

        setArrayValue(arrayValue);
    };

    const handleRemoveValue = (index: number) => {
        if (index > -1) {
            arrayValue.splice(index, 1);
        }
        setArrayValue(arrayValue);
    };

    return [arrayValue, handleAddValue, handleRemoveValue] as const;

    // const handleRemoveValue = <
    //     KEY extends keyof typeof person,
    //     VAL extends typeof person[KEY]
    // >(
    //     p: KEY,
    //     value: VAL
    // ) => {
    //     handleSetPerson({ ...person, [p]: value });
    // };
};
