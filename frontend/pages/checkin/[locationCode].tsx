import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import * as React from "react";
import { useCheckout } from "../../components/api/ApiHooks";
import {
    doCheckinRequest,
    redirectServerSide,
} from "../../components/api/ApiService";
import { useAppState } from "../../components/common/AppStateProvider";
import { Button, ButtonWithLoading } from "../../components/common/Button";
import LastCheckins from "../../components/common/LastCheckinsList";
import Title from "../../components/common/Title";
import { Checkin } from "../../model/Checkin";
import Subtitle from "../../components/common/Subtitle";
import CheckinSucessIcon from "../../components/common/CheckinSuccessIcon";
import Notice from "../../components/common/Notice";
import { appUrls, httpStatuses } from "../../config";
import { useTranslation, withLocaleProp } from "../../localization";

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

    React.useEffect(() => {
        if (!success) return;
        window.navigator.vibrate(200);
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
            <Title subtext={t("mit dir eingecheckt")}>
                {load !== 0 && "ca."} {load}{!!capacity && ` / ${capacity}`}
            </Title>
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
            <LastCheckins checkins={profile.last_checkins.slice(1).reverse()} />
            {/* <Button outline onClick={() => doCheckout(code)}>
                CHECK OUT 1.20.100
            </Button> */}
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
    const { dispatch } = useAppState();
    React.useEffect(() => {
        if (!checkin) {
            if (!!error)
                dispatch({
                    type: "status",
                    status: {
                        message: error,
                        isError: true,
                    },
                });
        }
    }, []);
    if (!checkin) return <>Checkin Failed</>;
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

        console.log("this is an error:", error);

        if (!!error)
            return {
                props: {
                    error,
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
