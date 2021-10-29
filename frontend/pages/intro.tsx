import * as React from "react";
import Title from "../components/common/Title";
import FormText from "../components/common/FormText";
import { Button } from "../components/common/Button";
import FormGroup from "../components/common/FormGroup";
import { useRouter } from "next/router";
import { appUrls } from "../config";
import Layout from "../components/common/Layout";

interface IntroPageProps {}

const IntroPage: React.FunctionComponent<IntroPageProps> = (props) => {
    const router = useRouter();
    return (
        <Layout>
            <FormGroup>
                <Title>Hellow</Title>
                <FormText paragraph>
                    Hier wird dir die App vorgestellt.
                </FormText>
            </FormGroup>
            <Button outline onClick={() => router.push(appUrls.createProfile)}>
                Los gehts
            </Button>
        </Layout>
    );
};

export default IntroPage;
