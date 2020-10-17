import { useRouter } from "next/router";
import * as React from "react";
import { useAppState } from "../components/common/AppStateProvider";
import { Button } from "../components/common/Button";
import LastCheckins from "../components/common/LastCheckinsList";
import Notice from "../components/common/Notice";
import PushToBottom from "../components/common/PushToBottom";
import Subtitle from "../components/common/Subtitle";
import { appUrls } from "../config";
import theme from "../styles/theme";
import { useUpdateProfileAppState } from "../components/api/ApiHooks";
import needsProfile from "../components/api/needsProfile";
import Profile from "../model/Profile";

interface ProfilePageProps {
    profile: Profile;
}

const ProfilePage: React.FunctionComponent<ProfilePageProps> = ({profile}) => {
    const { appState, dispatch } = useAppState();
    const router = useRouter();
    const { last_checkins} = profile!;
    const hasCheckins = last_checkins.length > 0;
    const { loading } = useUpdateProfileAppState();

    const handleCheckinClick = (index: number) => {
        const checkin = last_checkins[index];
        if (!checkin) return;
        if (!!checkin.time_left) return;
        const { location } = checkin;
        const { code } = location;
        router.push(...appUrls.checkin(code));
    };

    return (
        <>
            <style jsx>{`
                .button-group {
                    margin-top: ${theme.spacing(2)}px;
                    width: 100%;
                }
            `}</style>
            {loading && 
                <Notice>
                    ...aktualisiert
                </Notice>
            }
            <Subtitle>Protokoll</Subtitle>
            {hasCheckins && <LastCheckins onCheckinClick={handleCheckinClick} checkins={last_checkins} />}
            {!hasCheckins && <Notice>Noch keine Checkins vorhanden</Notice>}
            <PushToBottom>
                <div className="button-group">
                    <Button outline onClick={() => router.push(appUrls.setprofile)}>
                        Telefon ändern
                    </Button>
                    {/* <Button onClick={} outline>
                        Ausloggen
                    </Button> */}
                </div>
            </PushToBottom>
        </>
    );
};

export default needsProfile(ProfilePage);
