import * as React from "react";
import theme from "../../styles/theme";
import { useAppState } from "./AppStateProvider";
import Profile from "../../model/Profile";

interface ErrorBarProps {
    profile?: Profile;
}

const StatusBar: React.FunctionComponent<ErrorBarProps> = ({ profile }) => {
    const { appState, dispatch } = useAppState();
    const { error } = appState;

    const handleClose = () => {
        dispatch({
            type: "apiError",
            error: undefined,
        });
    };
    return (
        <>
            <style jsx>{`
                .status-bar {
                    padding: ${theme.spacing(2)}px ${theme.spacing(2)}px;
                    color: ${theme.primaryColor};
                    border-bottom: 1px solid ${theme.primaryColor};
                }

                .profile {
                    font-weight: bold;
                }

                .error {
                    text-decoration: underline;
                }
            `}</style>
            {!error && profile && (
                <div key="profile" className="status-bar" onClick={handleClose}>
                    <div className="profile">
                        {profile.first_name} {profile.last_name} {profile.phone}
                    </div>
                </div>
            )}
            {error && <div key="error" className="status-bar" onClick={handleClose}>{error}</div>}
        </>
    );
};

export default StatusBar;
