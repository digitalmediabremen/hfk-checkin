import React from "react";
import Notice from "../common/Notice";
import Subtitle from "../common/Subtitle";
import Text from "../common/Text";

const HelpContentEn = () => {
    return (
        <>
            <style jsx>
                {`
                    a {
                        text-decoration: underline;
                    }
                `}
            </style>
            <Notice>
                Looking for a QR scanner app? See below.
            </Notice>
            <Subtitle>Support for the Checkin application</Subtitle>
            <Text paragraph>
                Please send any questions about the Checkin application,
                self-documentation, room labels or problem reports to:
                <br />
                <br />
                <strong>
                    <a href="mailto:checkin@hfk-bremen.de">checkin@hfk-bremen.de</a>
                </strong>
                <br />
                <br />
                This application and the access procedure to Speicher XI are
                currently running in trail.
            </Text>
            <Subtitle>Additional Information</Subtitle>
            <Text paragraph>
                You fill find current information on Corona measures and
                hygiene rules in your HfK mailbox and at{" "}
                <a href="https://www.hfk-bremen.de/en/corona-info" target="_blank">
                    hfk-bremen.de/en/corona-info
                </a>
                . Please stay informed!
            </Text>
            <Subtitle>QR scanner app recommendations</Subtitle>
            <Text paragraph>
                On iOS and Android can scan QR codes since 2017 with
                the systems camera application without additional software.
                If you would like to use additional apps, please use one of the following {" "}
                <strong>free and ad-free apps</strong>:
                <br />
                <br />
                on Apple iOS:{" "}
                <a href="https://apps.apple.com/de/app/qrs-clean-fast-qr-scanner/id1042620761">
                    QRs App
                </a>
                <br />
                on Android:{" "}
                <a href="https://play.google.com/store/apps/details?id=de.markusfisch.android.binaryeye">
                    Binary Eye App
                </a>
                <br />
                <br />
                <i>
                    Note: Terms and condidtions of respective providers and app stores may apply.
                    Despite careful examination, HfK Bremen can not take responsibility for linked apps and websites.
                </i>
            </Text>
        </>
    );
};

export default HelpContentEn;
