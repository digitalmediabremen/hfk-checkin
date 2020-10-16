import * as React from "react";
import Title from "../components/common/Title";
import Subtitle from "../components/common/Subtitle";
import { useAppState } from "../components/common/AppStateProvider";
import LastCheckins from "../components/common/LastCheckinsList";
import { Button } from "../components/common/Button";
import PushToBottom from "../components/common/PushToBottom";
import FormGroup from "../components/common/FormGroup";
import theme from "../styles/theme";
import { appUrls } from "../config";
import { useRouter } from "next/router";

interface ProfilePageProps {}

const ProfilePage: React.FunctionComponent<ProfilePageProps> = (props) => {
    const { appState, dispatch } = useAppState();
    const router = useRouter();
    const { profile } = appState;
    if (!profile) return <>no profile set</>;

    return (
        <>
            <style jsx>{`
                .button-group {
                    margin-top: ${theme.spacing(2)}px;
                }
            `}</style>
            <Subtitle>Profil</Subtitle>
            <LastCheckins checkins={profile.last_checkins} />
            <PushToBottom>
                <div className="button-group">
                    <Button onClick={() => router.push(appUrls.setprofile)}>
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

export default ProfilePage;
