
interface Profile {
    firstName: string;
    lastName: string;
    phone: string;
    verified: boolean;
}

export default Profile;
export type ProfileUpdate = Omit<Profile, "authenticated">