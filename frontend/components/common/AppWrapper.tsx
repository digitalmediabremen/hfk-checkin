import Link from "next/link";
import React, { SFC } from "react";
import { appUrls } from "../../config";
import { useTranslation } from "../../localization";
import Profile from "../../model/Profile";
import theme from "../../styles/theme";
import StatusBar from "./StatusBar";
import { useUpdateProfileFromAppStateAndUpdate } from "../api/ApiHooks";
import EnterCodeButton from "./EnterCodeButton";
import features from "../../features";

interface AppWrapperProps {
    profileFromServer?: Profile;
}

const AppWrapper: SFC<AppWrapperProps> = ({ profileFromServer, children }) => {
    useUpdateProfileFromAppStateAndUpdate();
    return <>{children}</>;
};

export default AppWrapper;
