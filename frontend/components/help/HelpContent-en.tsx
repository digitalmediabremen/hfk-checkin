import React from "react";
import Notice from "../common/Notice";
import Subtitle from "../common/Subtitle";
import Text from "../common/Text";
import HelpSection, { useOnlyOneOpen } from "./HelpSection";

const HelpContentEn = () => {
    const openPropsProvider = useOnlyOneOpen(true);

    return (
        <>
            <style jsx>
                {`
                    a {
                        text-decoration: underline;
                    }
                `}
            </style>
            <Notice>Looking for a QR scanner app? See below.</Notice>
            <HelpSection
                {...openPropsProvider(0)}
                title="1. How does checkin and checkout work?
                "
            >
                <Text paragraph>
                    As soon as you have registered using your HfK-email-address
                    and password, you can start a protocol of your presence on
                    your smartphone. There is no need to install an app. This
                    service also works on pcs and tablets.
                    <br />
                    <br />
                    Do scan the QR-code at every location or enter the
                    four-digit code for your room via your keyboard.
                    <br />
                    <br />
                    This procedure will create a protocol during your stay at
                    the HfK that then can be used to trace infections as they
                    occur.
                    <br />
                    <br />
                    Please do not forget to check out every time you leave a
                    room. And do check out as you leave our premises (at this
                    time only Speicher XI)!
                </Text>
            </HelpSection>

            <HelpSection
                {...openPropsProvider(1)}
                title="2. When do I have to check in?"
            >
                <Text paragraph>
                    Please check into Speicher XI as you enter the building.
                    Then check into every single room. If you use different
                    rooms at the same time, you can stay checked into all of
                    them.
                </Text>
            </HelpSection>

            <HelpSection
                {...openPropsProvider(2)}
                title="3. When do I have to check out? Am I being checked out by the system automatically?"
            >
                <Text paragraph>
                    Please do check yourself out as you leave a room and the
                    building for the day. Shorter leaves such as bath room
                    breaks do not need to be entered into the protocol – as long
                    as no encounters with other people occur during breaks.
                    <br />
                    <br />
                    There is no automatic checkout in place. But your checkin
                    expires after 24 hours. This poses a significant problem for
                    eventual tracing efforts.
                </Text>
            </HelpSection>

            <HelpSection
                {...openPropsProvider(3)}
                title="4. Do I have to keep booking rooms?"
            >
                <Text paragraph>
                    Yes, you still have to book rooms to access offices, studios
                    and workshops.
                    <br />
                    <br />
                    You can only access Speicher XI without a prior reservation
                    to visit the library and the cafeteria or use printers.
                </Text>
            </HelpSection>

            <HelpSection
                {...openPropsProvider(4)}
                title="5. Do I need a QR-code scanner?"
            >
                <Text paragraph>
                    No. You can check in and check out simply by entering the
                    four-digit room code <b>or</b> by scanning QR-codes. The
                    service can be used without a QR-scanner. Only a web browser
                    and an active internet connection are required. You can
                    check in and check out by using a smartphone or a laptop.
                </Text>
            </HelpSection>

            <HelpSection
                {...openPropsProvider(5)}
                title="6. How do I scan QR-codes?"
            >
                <Text paragraph>
                    Starting in 2017, iOS and Android operation systems enable
                    the scanning of QR-codes simply by using standard camera
                    apps. If you do need an additional app, you are welcome to
                    use one of these QR-scanner apps for free and without
                    advertisements:
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
                        Please be aware: The terms of use set by providers and
                        app stores still do apply for your use. Although we have
                        thoroughly examined the apps, the HfK Bremen can not
                        take any responsibility for the apps and the links
                        provided by their use.
                    </i>
                </Text>
            </HelpSection>

            <HelpSection
                {...openPropsProvider(6)}
                title="7. How can I access the app in a more expeditious way?
"
            >
                <Text paragraph>
                    Add the app to the home screen of your smartphone just like
                    any other app. This works like a shortcut via a bookmark.
                    <br />
                    <br />
                    For the Apple iOS:
                    <ol>
                        <li>Open Safari</li>
                        <li>Go to checkin.hfk-bremen.de</li>
                        <li>
                            Open the function “share” (↑) at the center of the
                            menu bar at the bottom of the screen.
                        </li>
                        <li>
                            Choose “Zum Home-Bildschirm“ (“go to home screen”).
                        </li>
                    </ol>
                    <br />
                    For Android with Chrome or Firefox:
                    <ol>
                        <li>Open Chrome or Firefox</li>
                        <li>Go to checkin.hfk-bremen.de</li>
                        <li>
                            Enter (⋮) on the menu bar at the bottom of the
                            screen.
                        </li>
                        <li>
                            Choose “Zum Startbildschirm hinzufügen“ (“add to the
                            start up screen“).
                        </li>
                    </ol>
                </Text>
            </HelpSection>

            <HelpSection
                {...openPropsProvider(7)}
                title="8. Questions or problems with using Checkin?"
            >
                <Text paragraph>
                    Please send any questions that might arise for using the
                    app, setting up and running protocols and the signage of
                    rooms, as well as any problems you might become aware of,
                    to:
                    <br />
                    <br />
                    <a href="mailto:checkin@hfk-bremen.de">
                        checkin@hfk-bremen.de
                    </a>
                    <br />
                    <br />
                    The application and the new process to enter the building
                    and individuals are currently run in test mode.
                </Text>
            </HelpSection>

            <HelpSection
                {...openPropsProvider(8)}
                title="9. Further information on Corona"
            >
                <Text paragraph>
                    Please find many answers on rules and procedures relating to
                    your studies at the HfK starting with WiSe 2020 (this
                    semester) at:{" "}
                    <a href="https://faq.hfk-bremen.de/">faq.hfk-bremen.de</a>.
                    <br />
                    <br />
                    We are constantly updating relevant information on our
                    binding measures taken on Corona and hygiene at your Hfk
                    in-box and at:{" "}
                    <a
                        href="https://www.hfk-bremen.de/corona-info"
                        target="_blank"
                    >
                        hfk-bremen.de/corona-info
                    </a>
                    <br />
                    <br />
                    Please stay informed!
                </Text>
            </HelpSection>
        </>
    );
};

export default HelpContentEn;
