import { NextPage, NextPageContext } from "next";
import { useRouter } from 'next/router';
import * as config from "../config";
import { useState } from "react";
import RegisterGuestForm from "../components/new/RegisterGuestForm";

const NewProfilePage: NextPage = () => {
    const router = useRouter();
    const [isGuest, setGuest] = useState(false);
    const handleIntern = () => {
        const url = `${config.authRedirectUrl}/?next=${config.appUrl}/profile`
        router.replace(url);
        console.log(url);
    }
    const handleGuest = () => {
        router.push("/profile");
    }

    return (
        <>
        <h1>Gast oder Hfk-Mitglied?</h1>
        <button onClick={handleGuest}>Gast</button>
        <button onClick={handleIntern}>Mitglied</button>
        {isGuest && <RegisterGuestForm />}
        </>
    )
};

export default NewProfilePage;
NewProfilePage.getInitialProps = async (ctx: NextPageContext) => {

    return {};
};
