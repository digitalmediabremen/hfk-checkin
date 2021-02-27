import { Profiler } from "react";
import { Writable, WritableKeys } from "../../util/TypeUtil";
import { LastCheckin } from "./Checkin";

interface Profile {
    readonly id: number;
    first_name: string;
    last_name: string;
    phone: string | null;
    /**
     * @TJS-format email
     */
    email: string;
    readonly verified: boolean;
    readonly last_checkins: Array<LastCheckin>;
}

export type SimpleProfile = Omit<Profile, "last_checkins">;

export const assertProfile = (p: any): asserts p is Profile => {
    if (
        p.id === undefined ||
        p.first_name === undefined ||
        p.last_name === undefined ||
        p.phone === undefined ||
        p.verified === undefined
    )
        throw "Api Response is not a Profile";
};

export default Profile;

export type ProfileUpdate = Writable<Profile>;
