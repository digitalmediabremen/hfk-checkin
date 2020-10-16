import { LastCheckin } from "./Checkin";

interface Profile {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    verified: boolean;
    last_checkins: Array<LastCheckin>;
}

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
export type ProfileUpdate = Omit<Profile, "verified" | "id" | "last_checkins">;
