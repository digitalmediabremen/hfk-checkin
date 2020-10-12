import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import * as React from "react";
import { useCheckout } from "../../components/api/ApiHooks";
import {
    doCheckinRequest,
    redirectServerSide
} from "../../components/api/ApiService";
import { useAppState } from "../../components/common/AppStateProvider";
import { Button } from "../../components/common/Button";
import LastCheckins from "../../components/common/LastCheckinsList";
import Title from "../../components/common/Title";
import { Checkin } from "../../model/Checkin";
import Subtitle from "../../components/common/Subtitle";
import CheckinSucessIcon from "../../components/common/CheckinSuccessIcon";

interface CheckinProps {
    checkin?: Checkin;
    error?: string;
}

export const CheckinComponent: React.FunctionComponent<{
    checkin: Checkin;
}> = ({ checkin }) => {
    const { location, profile } = checkin;
    const { org_name, org_number, capacity, load, code } = location;
    const { doCheckout, success } = useCheckout();
    const { dispatch } = useAppState();
    const router = useRouter();

    React.useEffect(() => {
        if (!success) return;
        dispatch({
            type: "status",
            status: {
                message: "Erfolgreich ausgecheckt",
                isError: false
            }
        })
        router.push("/");
    }, [success]);

    return (
        <>
            <CheckinSucessIcon />
            <Title bold subtext={org_number}>{org_name}</Title>
            <Title subtext="mit dir eingecheckt">
                {load !== 0 && "ca."} {load} / {capacity}
            </Title>
            <br />
            <Button  onClick={() => doCheckout(code)}>
                CHECK OUT
            </Button>
            <br />
            <br />
            <br />
            <Subtitle>Letzte Checkins</Subtitle>
            <LastCheckins checkins={profile.last_checkins.slice(1).reverse()} />
            {/* <Button outline onClick={() => doCheckout(code)}>
                CHECK OUT 1.20.100
            </Button> */}
        </>
    );
};

const CheckinPage: React.FunctionComponent<CheckinProps> = ({
    checkin,
    error,
}) => {
    const { dispatch } = useAppState();
    React.useEffect(() => {
        if (!checkin) {
            if (!!error)
                dispatch({
                    type: "status",
                    status: {
                        message: error,
                        isError: true
                    },
                });
        }
    }, []);
    if (!checkin) return <>

    </>;
    return <CheckinComponent checkin={checkin} />;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const cookie = context.req.headers.cookie!;
    const { locationCode: locationCodePossiblyArray } = context.query;
    const empty = { props: {} };
    const locationCode = Array.isArray(locationCodePossiblyArray)
        ? locationCodePossiblyArray[0]
        : locationCodePossiblyArray;

    if (!locationCode) {
        redirectServerSide(context.res, "/");
        return empty;
    }

    const { error, data: checkin, status } = await doCheckinRequest(
        locationCode,
        {
            cookie,
        }
    );

    // redirect when not logged in
    if (status === 403) {
        redirectServerSide(context.res, "/new");
        return empty;
    }

    console.log("this is an error:", error);

    if (!!error) return {
        props: {
            error
        },
    };

    return {
        props: {
            checkin,
        },
    };
};

export default CheckinPage;
