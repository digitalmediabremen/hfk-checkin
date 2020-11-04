import React, { useEffect } from "react";
import { useRouter } from "next/router";
import needsProfile from "../../components/api/needsProfile";
import Profile from "../../model/Profile";
import useParam from "../../components/hooks/useParam";
import { useCheckin } from "../../components/api/ApiHooks";
import { CheckinComponent } from "../checkin/[locationCode]";
import Title from "../../components/common/Title";

interface CheckoutPageProps {
    profile: Profile;
}

const CheckoutPage: React.FunctionComponent<CheckoutPageProps> = ({
    profile,
}) => {
    const [checkinId, router] = useParam("checkinId");
    const { data } = useCheckin(checkinId);

    if (!checkinId) return null;
    if (data.state === "loading" || data.state === "initial")
        return <Title>...</Title>;
    if (data.state === "error") return <>{data.error}</>;

    return (
        <CheckinComponent
            profile={profile}
            checkin={data.result}
            alreadyCheckedIn={true}
        />
    );
};

export default needsProfile(CheckoutPage);
