import Profile from "../../model/Profile";
import { useEffect, Component } from "react";
import { useRouter } from "next/router";
import { appUrls } from "../../config";
import { useUpdateProfileAppState } from "./ApiHooks";
import { useAppState } from "../common/AppStateProvider";

interface NeedsProfileProps {
    profile: Profile;
}

const needsProfile = <P extends object>(
    Component: React.ComponentType<P & NeedsProfileProps>
): React.FC<P> => (props) => {
    const router = useRouter();
    // if prop is present set appstate
    // else retrieve appstate
    const { appState, dispatch } = useAppState();
    const { profile, initialized } = appState;

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
    return <Component profile={profile} {...(props as P)} />;
};

export default needsProfile;
