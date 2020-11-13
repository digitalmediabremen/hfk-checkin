import React from "react";
import Notice from "../common/Notice";
import Subtitle from "../common/Subtitle";
import Text from "../common/Text";

const PrivacyContentEn = () => {
    return (
        <>
            <style jsx>
                {`
                    a {
                        text-decoration: underline;
                    }
                `}
            </style>
            <Subtitle>
                Hochschule für Künste Bremen
                <br />
                Am Speicher XI 8<br />
                D-28217 Bremen
            </Subtitle>
            <Text paragraph>
                Represented by the rector Prof. Roland Lambrette.
            </Text>
            <Subtitle>Privicy Policy</Subtitle>
            <Text paragraph>
                Data is collected for the purpose of tracing chains of infection in
                connection with the coronavirus SARS CoV-2. The legal basis for processing
                is art. 6 para. 1 lit. c GDPR (DSGVO) in conjunction with § 5 para. 2 no. 3, § 8 eighteenth
                regulation for the protection against new infections with the coronavirus SARS-CoV-2
                (Achtzehnte Verordnung zum Schutz vor Neuinfektionen mit dem Coronavirus SARS-CoV-2).
            </Text>
            <Text paragraph>
                We process your data only as long as it is necessary for the purposes for which they were collected.
                Therefore, your data will be stored for a period of three weeks and will be destroyed or deleted after
                the storage period has expired.
            </Text>
            <Text paragraph>
                Full{" "}
                <a
                    href="https://www.hfk-bremen.de/sites/default/files/media/2020_info_datenschutz_nutzerinnen_hfk_bremen.pdf"
                    target="_blank"
                >
                    data protection regulations
                </a>{" "}
                of this application can be found on the website of HfK Bremen.
            </Text>
        </>
    );
};

export default PrivacyContentEn;
