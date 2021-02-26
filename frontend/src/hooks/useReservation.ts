import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import { ArrayLiteralExpression } from "ts-morph";
import { useAppState } from "../../components/common/AppStateProvider";
import NewReservationBlueprint from "../model/api/NewReservationBlueprint";
import Reservation from "../model/api/Reservation";
import { empty, notEmpty } from "../util/TypeUtil";

type ModifierFunction<I, O> = (value: I) => O;

type ConditionalReturnType<RF, WF, ApiDataType> = readonly [
    RF extends ModifierFunction<infer I, infer O> ? O : ApiDataType,
    WF extends ModifierFunction<infer I, infer O>
        ? (value: I) => void
        : (value: ApiDataType) => void
];

// type IfOrElse<Cond, Thi, Tha> = Cond extends undefined

export function useReservation() {
    const { appState } = useAppState();
    return appState.reservation || {};
}

export default function useReservationState<
    ReservationFieldType extends keyof NewReservationBlueprint
>(field: ReservationFieldType) {
    const { appState, dispatch } = useAppState();
    const reservation = appState.reservation;
    const value = appState.reservation?.[field];
    const setHandler = useCallback((
        value: NewReservationBlueprint[ReservationFieldType]
    ) => {
        console.log(`reservation mutation: [${field}]: ${value}`);
        dispatch({
            type: "updateReservation",
            reservation: {
                ...reservation,
                [field]: value,
            },
        });
    }, []);

    return [value, setHandler] as const;
}

type ArrayOnly<T> = {
    [K in keyof T as T[K] extends Array<infer S> | undefined ? K : never]: T[K];
};

type test = keyof ArrayOnly<NewReservationBlueprint>;

export const useSubpageQuery = <
    ReservationFieldType extends keyof NewReservationBlueprint
>(
) => {
    const router = useRouter();
    const q = Object.values(router.query)?.[0];
    const qq = Array.isArray(q) ? q[0] : q;

    const i = (notEmpty(qq) && qq !== "") ? parseInt(qq) : undefined;
    const [index, setIndex] = useState(i || 0);
    useEffect(() => {
        if (notEmpty(i)) setIndex(i);
    }, [i]);
    return index;
};

type ExtractTypeFromArray<ArrayType extends Array<unknown> | undefined> = ArrayType extends Array<infer T> ? T : never;


export const useReservationArrayState = <
    ReservatonFieldType extends keyof ArrayOnly<NewReservationBlueprint>
>(
    key: ReservatonFieldType
) => {
    const [_arrayValue, setArrayValue] = useReservationState(key);
    const arrayValue = notEmpty(_arrayValue) ? _arrayValue : [];
    
    const handleAddValue = (value: ExtractTypeFromArray<NewReservationBlueprint[ReservatonFieldType]>, index: number) => {
        if (empty(value)) return;
        arrayValue[index] = value;
        console.log('arr',arrayValue)

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
