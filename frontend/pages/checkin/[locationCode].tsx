import { useRouter } from "next/router";
import * as React from "react";
import { useDoCheckin, useDoCheckout } from "../../components/api/ApiHooks";
import needsProfile from "../../components/api/needsProfile";
import { useAppState } from "../../components/common/AppStateProvider";
import { ButtonWithLoading } from "../../components/common/Button";
import CheckinSucessIcon from "../../components/common/CheckinSuccessIcon";
import LastCheckins from "../../components/common/LastCheckinsList";
import PushToBottom from "../../components/common/PushToBottom";
import Subtitle from "../../components/common/Subtitle";
import Title from "../../components/common/Title";
import useParam from "../../components/hooks/useParam";
import { appUrls } from "../../config";
import { useTranslation } from "../../localization";
import { LastCheckin } from "../../model/Checkin";
import Profile from "../../model/Profile";
import FormElementWrapper from "../../components/common/FormElementWrapper";

export const CheckinComponent: React.FunctionComponent<{
    checkin: LastCheckin;
    profile: Profile;
    alreadyCheckedIn: boolean;
}> = ({ profile, checkin, alreadyCheckedIn }) => {
    const { location } = checkin;
    const { org_name, org_number, capacity, load, code } = location;
    const {
        doCheckout,
        success,
        loading: checkoutInProgress,
    } = useDoCheckout();
    const { dispatch } = useAppState();
    const router = useRouter();

    const { t } = useTranslation("checkin");
    const isRootLocation = load === -1;

    React.useEffect(() => {
        if (!alreadyCheckedIn) window?.navigator?.vibrate?.(200);
    }, []);

    React.useEffect(() => {
        if (!success) return;
        dispatch({
            type: "status",
            status: {
                message: t("Erfolgreich ausgecheckt"),
                isError: false,
            },
        });
        router.push(appUrls.enterCode);
    }, [success]);

    return (
        <>
            {!alreadyCheckedIn && <CheckinSucessIcon />}
            {/* {alreadyCheckedIn && (
                <Notice>{t("Du bist bereits eingecheckt")}.</Notice>
            )} */}
            <Title bold subtext={org_number}>
                {org_name}
            </Title>
            {!isRootLocation && (
                <Title subtext={t("insgesamt eingecheckt")}>
                    {load}
                    {!!capacity && ` / ${capacity}`}
                </Title>
            )}
            <br />
            <ButtonWithLoading
                loading={checkoutInProgress}
                onClick={() => doCheckout(code)}
                {...(!alreadyCheckedIn ? { outline: true } : undefined)}
            >
                {t("Auschecken")}
            </ButtonWithLoading>
            <PushToBottom offsetBottomPadding>
                <FormElementWrapper noBottomMargin>
                    <Subtitle>{t("Andere Checkins")}</Subtitle>

                    <LastCheckins
                        checkins={profile.last_checkins.slice(0, 4)}
                    />
                </FormElementWrapper>
            </PushToBottom>
        </>
    );
};

interface CheckinProps {
    profile: Profile;
}

const CheckinPage: React.FunctionComponent<CheckinProps> = ({ profile }) => {
    const { t } = useTranslation("checkin");
    const [locationCode, router] = useParam("locationCode");
    const { data, alreadyCheckedIn } = useDoCheckin(locationCode);

    // prefetch url which is later redirected to
    React.useEffect(() => {
        if (data.state !== "success") return;
        const url = appUrls.checkout(data.result.id);
        router.prefetch(...url);
        if (alreadyCheckedIn) router.replace(...url);
    });

    if (data.state !== "success") return null;
    if (alreadyCheckedIn) return null;

    return (
        <CheckinComponent
            checkin={data.result}
            profile={data.result.profile}
            alreadyCheckedIn={alreadyCheckedIn}
        />
    );
};

export default needsProfile(CheckinPage);
