import Profile from "../../model/Profile";
import { useEffect, Component } from "react";
import { useRouter } from "next/router";
import { appUrls } from "../../config";
import { useAppState } from "../common/AppStateProvider";
import { useUpdateProfileFromAppStateAndUpdate } from "./ApiHooks";
import { useTranslation } from "../../localization";

interface NeedsProfileProps {
    profile: Profile;
    profileUpdating: boolean;
}

const needsProfile = <P extends object>(
    Component: React.ComponentType<P & NeedsProfileProps>
): React.FC<P> => (props) => {
    const router = useRouter();
    const { t } = useTranslation(); 
    const { appState, dispatch } = useAppState();
    const { initialized } = appState;
    const { profile, error, loading } = useUpdateProfileFromAppStateAndUpdate();
    useEffect(() => {
        if (error) dispatch({
            type: "status",
            status: {
                isError: true,
                message: error
            }
        })
    }, [error])

    useEffect(() => {
        if (!initialized) return; 

        if (!profile) {
            router.replace(appUrls.createProfile);
        }
        else if (!profile.phone) {
            router.replace(appUrls.setprofile);
        }
    }, [initialized]);

    if (!profile || !profile.phone) return null;
    return <Component profile={profile} profileUpdating={loading} {...(props as P)} />;
};

export default needsProfile;
