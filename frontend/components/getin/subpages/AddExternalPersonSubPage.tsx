import { isValidNumber } from "libphonenumber-js";
import React, { useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { requestSubpages } from "../../../config";
import { useTranslation } from "../../../localization";
import {
    useReservationArrayState,
    useSubpageQuery,
} from "../../../src/hooks/useReservationState";
import { AttendanceUpdate } from "../../../src/model/api/MyProfile";
import useSubPage from "../../api/useSubPage";
import FormPhoneInput from "../../common/FormPhoneInput";
import FormTextInput from "../../common/FormTextInput";
import NewButton from "../../common/NewButton";
import Notice from "../../common/Notice";

interface AddExternalPersonSubPageProps {}

const AddExternalPersonSubPage: React.FunctionComponent<AddExternalPersonSubPageProps> = ({}) => {
    const { t } = useTranslation();
    const index = useSubpageQuery();
    const [attendees, addAttendee] = useReservationArrayState("attendees");

    const { goBack } = useSubPage(requestSubpages);
    const { errors, handleSubmit, control } = useForm<AttendanceUpdate>({
        mode: "onTouched",
        defaultValues: {
            // email: attendees?.[index]?.email || "",
            first_name: attendees?.[index]?.first_name || "",
            last_name: attendees?.[index]?.last_name || "",
            phone: attendees?.[index]?.phone || "",
        },
    });

    const controllerProps = useCallback(
        (name: keyof AttendanceUpdate, translatedName: string, rules?: {}) => ({
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

    const handleAddAttendee = (value: AttendanceUpdate) => {
        // Todo: validate person
        addAttendee(value, index);
        goBack("attendees");
    };

    return (
        <form
            onSubmit={handleSubmit(handleAddAttendee)}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
        >
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
                as={<FormPhoneInput disabled />}
                {...controllerProps("phone", t("Telefonnummer"), {
                    validate: (value: string) =>
                        !isValidNumber(value, "DE")
                            ? t("Keine gültige Telefonnummer")
                            : undefined,
                })}
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
