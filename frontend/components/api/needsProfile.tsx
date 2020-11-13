import Profile from "../../model/Profile";
import { useEffect, Component } from "react";
import { useRouter } from "next/router";
import { appUrls } from "../../config";
import { useAppState } from "../common/AppStateProvider";
import { useUpdateProfileFromAppStateAndUpdate } from "./ApiHooks";
import { useTranslation } from "../../localization";
import Title from "../common/Title";
import Loading from "../common/Loading";

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
    const {
        profile,
        error,
        loading,
        additionalData,
    } = useUpdateProfileFromAppStateAndUpdate(true);
    useEffect(() => {
        if (error)
            dispatch({
                type: "status",
                status: {
                    isError: true,
                    message: error,
                },
            });
    }, [error]);

    useEffect(() => {
        if (!initialized) return;

        if (additionalData?.notAuthorized) {
            router.replace(appUrls.createProfile);
        } else if (profile && !profile.phone) {
            router.replace(appUrls.setprofile);
        }
    }, [initialized, additionalData]);

    if (
        !loading &&
        (additionalData?.notAuthorized || (profile && !profile.phone))
    ) {
        return null;
    }

    if (!profile && error) {
        return <Title>Da ist etwas schief gelaufen.</Title>;
    }

    return (
        <Loading loading={loading && !profile}>
            {profile && (
                <Component
                    profile={profile!}
                    profileUpdating={loading}
                    {...(props as P)}
                />
            )}
        </Loading>
    );
};

export default needsProfile;
