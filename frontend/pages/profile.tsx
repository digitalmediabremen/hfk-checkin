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
import { GetServerSideProps } from "next";
import { withLocaleProp } from "../localization";
import Notice from "../components/common/Notice";

interface ProfilePageProps {}

const ProfilePage: React.FunctionComponent<ProfilePageProps> = (props) => {
    const { appState, dispatch } = useAppState();
    const router = useRouter();
    const { profile } = appState;
    if (!profile) return <>no profile set</>;
    if (!profile.phone) { 
        router.replace(appUrls.setprofile);
        return null;
    }
    const { last_checkins} = profile;
    const hasCheckins = last_checkins.length > 0;

    return (
        <>
            <style jsx>{`
                .button-group {
                    margin-top: ${theme.spacing(2)}px;
                    width: 100%;
                }
            `}</style>
            <Subtitle>Protokoll</Subtitle>
            {hasCheckins && <LastCheckins interactive checkins={last_checkins} />}
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

export default ProfilePage;
