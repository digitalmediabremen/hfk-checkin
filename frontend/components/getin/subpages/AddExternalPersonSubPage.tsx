import React, { useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { requestSubpages } from "../../../config";
import { useTranslation } from "../../../localization";
import {
    useReservationArrayState,
    useSubpageQuery
} from "../../../src/hooks/useReservationState";
import { AttendanceUpdate } from "../../../src/model/api/MyProfile";
import { Writable } from "../../../src/util/TypeUtil";
import useSubPage from "../../api/useSubPage";
import FormTextInput from "../../common/FormTextInput";
import NewButton from "../../common/NewButton";
import Notice from "../../common/Notice";

interface AddExternalPersonSubPageProps {}

const AddExternalPersonSubPage: React.FunctionComponent<AddExternalPersonSubPageProps> = ({}) => {
    const { t } = useTranslation();
    const index = useSubpageQuery();
    const [attendees, addAttendee] = useReservationArrayState("attendees");
    // const [person, setPerson, setPersonField] = useAddExternalPersonState();z
    // useValidation

    const { goBack } = useSubPage(requestSubpages);
    const { errors, handleSubmit, control } = useForm<
        Writable<AttendanceUpdate>
    >({
        mode: "onTouched",
        defaultValues: {
            // email: attendees?.[index]?.email || "",
            first_name: attendees?.[index]?.first_name || "",
            last_name: attendees?.[index]?.last_name || "",
            phone: attendees?.[index]?.phone || "",
        },
    });

    const controllerProps = useCallback(
        (
            name: keyof Writable<AttendanceUpdate>,
            translatedName: string,
            rules?: {}
        ) => ({
            mode: "onTouched",
            name,
            control,
            rules: {
                required: t("{fieldName} darf nicht leer sein.", {
                    fieldName: translatedName,
                }),
                ...rules,
            },
            error: errors[name]?.message,
            label: translatedName,
        }),
        [errors, control]
    );

    const handleAddAttendee = (value: Writable<AttendanceUpdate>) => {
        // Todo: validate person
        addAttendee(value, index);
        goBack("attendees");
    };

    return (
        <form onSubmit={handleSubmit(handleAddAttendee)}>
            <style jsx>{``}</style>
            <Controller
                as={<FormTextInput />}
                {...controllerProps("first_name", t("Vorname"))}
            />

            <Controller
                as={<FormTextInput bottomSpacing={4} />}
                {...controllerProps("last_name", t("Nachname"))}
            />

            <Controller
                as={<FormTextInput />}
                {...controllerProps("phone", t("Telefonnummer"), {})}
            />
            {/* <Controller
                as={<FormTextInput bottomSpacing={2}></FormTextInput>}
                {...controllerProps("email", t("E-Mail"), {
                    pattern: {
                        value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                        message: t("Das ist leider keine E-Mail Adresse"),
                    },
                })}
            /> */}
            {/* <PhoneInput value="22" /> */}
            <Notice bottomSpacing={2}>
                {t(
                    "Die Telefonnummer wird auschliesslich im Falle einer  Infektionsnachverfolgung verwendet."
                )}
            </Notice>
            <NewButton primary>Hinzufügen</NewButton>
        </form>
    );
};

export default AddExternalPersonSubPage;
