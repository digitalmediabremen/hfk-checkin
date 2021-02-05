import dynamic from "next/dynamic";
import React, { useState } from "react";
import showIf from "../components/api/showIf";
import { Input } from "../components/common/Input";
import { LoadingScreen } from "../components/common/Loading";
import Page from "../components/common/Page";
import SubPage from "../components/common/SubPage";
import Title from "../components/common/Title";
import features from "../features";

const DynamicComponent = dynamic(
    () => import("../components/help/HelpContent-de"),
    {
        loading: () => <LoadingScreen />,
        ssr: false,
    }
);

const RequestRoomPage = () => {
    const [date, setDate] = useState<string>("2020-10-10");
    const [active, setActive] = useState(false);
    return (
        <Page hasActiveSubpage={active}>
            <style jsx>{``}</style>
            <div>
                <Title>Main Page</Title>
                <SubPage active={active} title="Unterseite" onBack={() => setActive(!active)}>
                    {() => <DynamicComponent />}
                </SubPage>
                <input onClick={() => setActive(!active)} type="date"></input>
                <input type="time"></input>
                <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.currentTarget.value)}
                    name="test"
                    label="test"
                />
            </div>
        </Page>
    );
};

export default showIf(() => features.getin, RequestRoomPage);
