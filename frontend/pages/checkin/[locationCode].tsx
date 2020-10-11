import * as React from "react";
import { GetServerSideProps } from "next";
import { doCheckinRequest } from "../../components/api/ApiService";
import { Checkin } from "../../model/Checkin";
import Title from "../../components/common/Title";
import Subtitle from "../../components/common/Subtitle";
import { Button } from "../../components/common/Button";
import { useCheckout } from "../../components/api/ApiHooks";

interface CheckinProps {
    checkin: Checkin;
}

export const CheckinComponent: React.FunctionComponent<{
    checkin: Checkin;
}> = ({ checkin }) => {
    const { location, profile } = checkin;
    const { org_name, org_number, capacity, load, code } = location;
    const { doCheckout } = useCheckout();
    console.log(profile.last_checkins);

    const LastCheckins: React.SFC<{}> = React.useCallback(
        () => (
            <>
                {profile.last_checkins.map((checkin, index) => {
                    const { org_name, org_number, id } = checkin.location;
                    return (
                        <div key={`${id}${index}`}>
                            {org_number} - {org_name}
                        </div>
                    );
                })}
            </>
        ),
        [profile]
    );
    return (
        <>
            <LastCheckins />
            <Title>{org_name}</Title>
            <Subtitle>{org_number}</Subtitle>
            <Title bold>
                {load !== 0 && "ca."} {load} / {capacity}
            </Title>
            <Subtitle>mit dir eingecheckt</Subtitle>
            <Button outline onClick={() => doCheckout(code)}>
                CHECK OUT
            </Button>
            toll ein checkin in {checkin.location.org_number}
        </>
    );
};

const CheckinPage: React.FunctionComponent<CheckinProps> = (props) => {
    return <CheckinComponent {...props} />;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const cookie = context.req.headers.cookie;
    const { locationCode: locationCodePossiblyArray } = context.query;
    const locationCode = Array.isArray(locationCodePossiblyArray)
        ? locationCodePossiblyArray[0]
        : locationCodePossiblyArray;

    const { error, data: checkin } = await doCheckinRequest(locationCode, {
        cookie,
    });

    if (error) return { props: {} };

    return {
        props: {
            checkin,
        },
    };
};

export default CheckinPage;
