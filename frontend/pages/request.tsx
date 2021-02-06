import dynamic from "next/dynamic";
import React, { useState } from "react";
import showIf from "../components/api/showIf";
import { Input } from "../components/common/Input";
import { LoadingScreen } from "../components/common/Loading";
import Layout from "../components/common/Page";
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
        <Layout hasActiveSubpage={active}>
            <style jsx>{``}</style>
            <div>
                <Title>Main Page</Title>
                <SubPage active={active} title="Unterseite" onBack={() => setActive(!active)}>
                    {() => <DynamicComponent />}
                </SubPage>
                <input type="time"></input>
                <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.currentTarget.value)}
                    name="test"
                    label="test"
                />
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem magnam excepturi iure sequi porro, esse adipisci ullam nisi voluptatem cupiditate nostrum aliquam quidem dolorem accusamus corrupti, fuga totam reiciendis? Lorem ipsum dolor sit amet consectetur adipisicing elit. Et libero magnam facere a doloribus officiis, molestias excepturi dolores reiciendis quidem voluptas praesentium optio sint laboriosam at sapiente, quis explicabo! Similique! Lorem ipsum dolor sit amet consectetur, adipisicing elit. Voluptates veniam laborum quod, architecto non dicta odit hic laboriosam consequuntur neque cum. Odit mollitia ad quod distinctio sequi, recusandae aspernatur. Lorem ipsum dolor sit amet consectetur, adipisicing elit. Architecto eveniet nesciunt nisi ullam. Ipsum, velit voluptatibus! Voluptatibus error laudantium ullam sequi officia, quas, nesciunt, quae nam vero tempora numquam sint!
                <input onClick={() => setActive(!active)} type="date"></input>

            </div>
        </Layout>
    );
};

export default showIf(() => features.getin, RequestRoomPage);
