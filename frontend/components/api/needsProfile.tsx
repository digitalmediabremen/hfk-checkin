import * as Sentry from "@sentry/node";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { appUrls } from "../../config";
import Error from "../../pages/Error";
import MyProfile from "../../src/model/api/MyProfile";
import { useAppState } from "../common/AppStateProvider";
import Loading from "../common/Loading";
import { useUpdateProfileFromAppStateAndUpdate } from "./ApiHooks";

interface NeedsProfileProps {
    profile: MyProfile;
    profileUpdating: boolean;
}

const needsProfile = <
    P extends NeedsProfileProps,
    HocProps = Omit<P, keyof NeedsProfileProps>
>(
    Component: React.ComponentType<P>
): React.FC<HocProps> => (props) => {
    const router = useRouter();
    const { appState, dispatch } = useAppState();
    const { initialized } = appState;
    const {
        profile,
        error,
        loading,
        additionalData,
    } = useUpdateProfileFromAppStateAndUpdate(true);

    const cameFromAuth = !!router.query?.["from-auth"];

    useEffect(() => {
        if (!initialized) return;
        if (loading) return;
        if (additionalData?.notAuthorized) {
            dispatch({
                type: "profile",
                profile: undefined,
            });
            if (!!profile || cameFromAuth) {
                console.log("cookie error");
                Sentry.captureMessage("Cookie Error", Sentry.Severity.Error);
                router.replace(appUrls.cookieError);
            } else {
                router.replace(appUrls.createProfile);
            }
        } else if (profile && !profile.phone) {
            router.replace(appUrls.setprofile);
        } else if (cameFromAuth) {
            router.replace(router.pathname);
        }

        if (profile) {
            Sentry.setUser({
                username: `${profile.first_name} ${profile.last_name}`,
                email: profile.email,
                verified: profile.verified
            });
        }
    }, [initialized, additionalData, cameFromAuth]);

    if (
        !loading &&
        (additionalData?.notAuthorized || (profile && !profile.phone))
    ) {
        return null;
    }

    if (!profile && error) {
        return <Error />;
    }

    return (
        <Loading loading={loading && !profile}>
            {profile && (
                <Component
                    profile={profile}
                    profileUpdating={loading}
                    {...(props as any)}
                />
            )}
        </Loading>
    );
};

export default needsProfile;
