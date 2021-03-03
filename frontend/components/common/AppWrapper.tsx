import React, { SFC } from "react";
import MyProfile from "../../src/model/api/MyProfile";
import { useUpdateProfileFromAppStateAndUpdate } from "../api/ApiHooks";

interface AppWrapperProps {
    profileFromServer?: MyProfile;
}

const AppWrapper: SFC<AppWrapperProps> = ({ profileFromServer, children }) => {
    useUpdateProfileFromAppStateAndUpdate();
    return <>{children}</>;
};

export default AppWrapper;
