import React from "react";
import {
    ResultModifierFunction,
    useActiveCheckins,
    useCheckin,
} from "../../components/api/ApiHooks";
import needsProfile from "../../components/api/needsProfile";
import showIf from "../../components/api/showIf";
import Layout from "../../components/common/Layout";
import Loading from "../../components/common/Loading";
import Title from "../../components/common/Title";
import features from "../../features";
import useParam from "../../src/hooks/useParam";
import { LastCheckin } from "../../src/model/api/Checkin";
import MyProfile from "../../src/model/api/MyProfile";
import { CheckinComponent } from "../checkin/[locationCode]";

interface CheckoutPageProps {
    profile: MyProfile;
}

const CheckoutPage: React.FunctionComponent<CheckoutPageProps> = ({
    profile,
}) => {
    const [checkinId, router] = useParam("checkinId");
    const { data } = useCheckin(checkinId);

    const excludeCheckinModifier = React.useCallback<
        ResultModifierFunction<LastCheckin[]>
    >(
        (checkins?: LastCheckin[]) => {
            return data.state === "success"
                ? checkins?.filter((c) => c.id !== data.result.id)
                : undefined;
        },
        [data.result]
    );

    const { data: activeCheckinData } = useActiveCheckins(
        excludeCheckinModifier
    );

    if (!checkinId) return null;
    if (data.state === "error") return <>{data.error}</>;

    return (
        <Layout>
            <Loading loading={data.state === "loading"}>
                {data.result && activeCheckinData.result && (
                    <CheckinComponent
                        activeCheckins={activeCheckinData.result!}
                        checkin={data.result!}
                        alreadyCheckedIn={true}
                        activeCheckinsUpdating={
                            activeCheckinData.state === "loading"
                        }
                    />
                )}
                {!!activeCheckinData.error && (
                    <Title>{activeCheckinData.error}</Title>
                )}
            </Loading>
        </Layout>
    );
};

export default showIf(() => features.checkin, needsProfile(CheckoutPage));
