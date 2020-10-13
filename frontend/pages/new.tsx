import { NextPage, NextPageContext } from "next";
import { useRouter } from "next/router";
import * as config from "../config";
import { useState } from "react";
import Subtitle from "../components/common/Subtitle";
import { Button } from "../components/common/Button";
import FormGroup from "../components/common/FormGroup";
import Text from "../components/common/Text";

const NewProfilePage: NextPage = () => {
    const router = useRouter();
    const handleIntern = () => {
        const url = `${config.authRedirectUrl}/?next=${config.appUrl}/profile`;
        router.replace(url);
        console.log(url);
    };
    const handleGuest = () => {
        router.push("/profile");
    };

    return (
        <>
            <FormGroup>
                <Subtitle>HFK BREMEN</Subtitle>

                <Text paragraph>
                    Nur mit Kontaktnachverfolgung sind Präsenzlehe, Nutzung der
                    Überäume, Ateliers und Werkstätten möglich. Bitte
                    Unterstütze die Maßnahmen durch Tragen einer
                    Mund-Nase-Bedeckung, Abstandsregeln und
                    eigenverantwortlicher Protokollierung deiner Anwesenheit.
                </Text>
            </FormGroup>
            <Subtitle>Hfk-Angehörige</Subtitle>
            <Button outline onClick={handleIntern}>
                HFK-LOGIN
            </Button>
            <Subtitle>Gäste</Subtitle>
            <Button outline onClick={handleGuest}>
                GASTZUGANG
            </Button>
        </>
    );
};

export default NewProfilePage;
NewProfilePage.getInitialProps = async (ctx: NextPageContext) => {
    return {};
};
