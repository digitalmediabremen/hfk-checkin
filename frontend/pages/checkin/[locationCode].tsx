import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import * as React from "react";
import { useCheckout } from "../../components/api/ApiHooks";
import {
    doCheckinRequest,
    redirectServerSide,
} from "../../components/api/ApiService";
import { useAppState } from "../../components/common/AppStateProvider";
import { ButtonWithLoading } from "../../components/common/Button";
import CheckinSucessIcon from "../../components/common/CheckinSuccessIcon";
import LastCheckins from "../../components/common/LastCheckinsList";
import Notice from "../../components/common/Notice";
import Subtitle from "../../components/common/Subtitle";
import Title from "../../components/common/Title";
import { appUrls, httpStatuses } from "../../config";
import { useTranslation, withLocaleProp } from "../../localization";
import { Checkin } from "../../model/Checkin";

export const CheckinComponent: React.FunctionComponent<{
    checkin: Checkin;
    alreadyCheckedIn: boolean;
}> = ({ checkin, alreadyCheckedIn }) => {
    const { location, profile } = checkin;
    const { org_name, org_number, capacity, load, code } = location;
    const { doCheckout, success, loading: checkoutInProgress } = useCheckout();
    const { dispatch } = useAppState();
    const router = useRouter();
    const { t } = useTranslation("checkin");
    const isRootLocation = capacity === -1;

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
                <Title subtext={t("mit dir eingecheckt")}>
                    {load}
                    {!!capacity && ` / ${capacity}`}
                </Title>
            )}
            <br />
            <ButtonWithLoading
                loading={checkoutInProgress}
                onClick={() => doCheckout(code)}
            >
                {t("Auschecken")}
            </ButtonWithLoading>
            <br />
            <br />
            <br />
            <Subtitle>{t("Letzte Checkins")}</Subtitle>
            <LastCheckins
                checkins={profile.last_checkins}
            />
        </>
    );
};

interface CheckinProps {
    checkin?: Checkin;
    error?: string;
    alreadyCheckedIn?: boolean;
}

const CheckinPage: React.FunctionComponent<CheckinProps> = ({
    checkin,
    error,
    alreadyCheckedIn,
}) => {
    const { t } = useTranslation();
    if (!checkin)
        return (
            <>
                <Title subtext={error}>{t("Checkin fehlgeschlagen")}</Title>
            </>
        );

    return (
        <CheckinComponent
            checkin={checkin}
            alreadyCheckedIn={alreadyCheckedIn || false}
        />
    );
};

export const getServerSideProps: GetServerSideProps = withLocaleProp(
    async (context) => {
        const cookie = context.req.headers.cookie!;
        const { locationCode: locationCodePossiblyArray } = context.query;
        const empty = { props: {} };
        const locationCode = Array.isArray(locationCodePossiblyArray)
            ? locationCodePossiblyArray[0]
            : locationCodePossiblyArray;

        if (!locationCode) {
            redirectServerSide(context.res, appUrls.enterCode);
            return empty;
        }

        const { error, data: checkin, status } = await doCheckinRequest(
            locationCode,
            {
                cookie,
            }
        );

        // redirect when not logged in
        if (status === httpStatuses.notAuthorized) {
            redirectServerSide(context.res, appUrls.createProfile);
            return empty;
        }

        if (!!error)
            return {
                props: {
                    error,
                    status,
                },
            };

        return {
            props: {
                checkin,
                alreadyCheckedIn: status === httpStatuses.alreadyCheckedIn,
            },
        };
    }
);

export default CheckinPage;
