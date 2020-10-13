import * as React from "react";
import Title from "../components/common/Title";
import Text from "../components/common/Text";
import { Button } from "../components/common/Button";
import FormGroup from "../components/common/FormGroup";
import { useRouter } from "next/router";
import { appUrls } from "../config";

interface IntroPageProps {}

const IntroPage: React.FunctionComponent<IntroPageProps> = (props) => {
    const router  = useRouter();
    return (
        <>
            <FormGroup>
                <Title>Welcome / Intro</Title>
                <Text paragraph>
                    This is the start page which will explain what this is and
                    how it works.
                </Text>
            </FormGroup>
            <Button outline onClick={() => router.push(appUrls.createProfile)}>
                Anmelden
            </Button>
        </>
    );
};

export default IntroPage;
