import React from "react";
import { useTranslation } from "../../localization";
import { myselfAttendeeFormValuePresenter } from "../../src/util/ReservationPresenterUtil";
import { useAppState } from "./AppStateProvider";
import FormElement from "./FormElement";

interface MyProfileFormElementProps {}

const MyProfileFormElement: React.FunctionComponent<MyProfileFormElementProps> =
    ({}) => {
        const { appState } = useAppState();
        const { myProfile } = appState;
        const { locale } = useTranslation();
        if (!myProfile) return null;
        return (
            <>
                <style jsx>{``}</style>
                <FormElement
                    value={myselfAttendeeFormValuePresenter(myProfile, locale)}
                    extendedWidth
                    bottomSpacing={1}
                    dotted
                    noOutline
                    // disabled
                ></FormElement>
            </>
        );
    };

export default MyProfileFormElement;
