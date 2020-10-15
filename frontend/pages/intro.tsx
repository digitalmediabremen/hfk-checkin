import * as React from "react";
import Title from "../components/common/Title";
import Text from "../components/common/Text";
import { Button } from "../components/common/Button";
import FormGroup from "../components/common/FormGroup";
import { useRouter } from "next/router";
import { appUrls } from "../config";
import { useTranslation } from "../localization";

interface IntroPageProps {}

const IntroPage: React.FunctionComponent<IntroPageProps> = (props) => {
    const router  = useRouter();
    return (
        <>
            <FormGroup>
                <Title>Willkommen</Title>
                <Text paragraph>
                    Hier wird dir die App vorgestellt
                </Text>
            </FormGroup>
            <Button outline onClick={() => router.push(appUrls.createProfile)}>
                Los gehts
            </Button>
        </>
    );
};

export default IntroPage;
