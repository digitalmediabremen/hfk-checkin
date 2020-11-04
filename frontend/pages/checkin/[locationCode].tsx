import { useRouter } from "next/router";
import * as React from "react";
import { useDoCheckin, useDoCheckout } from "../../components/api/ApiHooks";
import needsProfile from "../../components/api/needsProfile";
import { useAppState } from "../../components/common/AppStateProvider";
import { ButtonWithLoading } from "../../components/common/Button";
import CheckinSucessIcon from "../../components/common/CheckinSuccessIcon";
import LastCheckins from "../../components/common/LastCheckinsList";
import Notice from "../../components/common/Notice";
import Subtitle from "../../components/common/Subtitle";
import Title from "../../components/common/Title";
import useParam from "../../components/hooks/useParam";
import { appUrls } from "../../config";
import { useTranslation } from "../../localization";
import { Checkin } from "../../model/Checkin";

export const CheckinComponent: React.FunctionComponent<{
    checkin: Checkin;
    alreadyCheckedIn: boolean;
}> = ({ checkin, alreadyCheckedIn }) => {
    const { location, profile } = checkin;
    const { org_name, org_number, capacity, load, code } = location;
    const { doCheckout, success, loading: checkoutInProgress } = useDoCheckout();
    const { dispatch } = useAppState();
    const router = useRouter();
    const { t } = useTranslation("checkin");
    const isRootLocation = load === -1;

    React.useEffect(() => {
        window?.navigator?.vibrate?.(200);
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
            {alreadyCheckedIn && (
                <Notice>{t("Du bist bereits eingecheckt")}.</Notice>
            )}
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
                {...(!alreadyCheckedIn ? ({ outline: true }) : undefined)}
            >
                {t("Auschecken")}
            </ButtonWithLoading>
            <br />
            <br />
            <br />
            <Subtitle>{t("Letzte Checkins")}</Subtitle>
            <LastCheckins
                checkins={profile.last_checkins.slice(0, 4)}
            />
        </>
    );
};

interface CheckinProps {
    checkin?: Checkin;
    error?: string;
    alreadyCheckedIn?: boolean;
}

const CheckinPage: React.FunctionComponent<CheckinProps> = () => {
    const { t } = useTranslation("checkin");
    const [ locationCode, ] = useParam("locationCode"); 
    const { data, alreadyCheckedIn } = useDoCheckin(locationCode);

    if (data.state !== "success") return null;

    return (
        <CheckinComponent
            checkin={data.result}
            alreadyCheckedIn={alreadyCheckedIn}
        />
    );
};

export default needsProfile(CheckinPage);
