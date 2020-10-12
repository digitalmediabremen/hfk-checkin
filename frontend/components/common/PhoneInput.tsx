import { SFC, ChangeEvent, InputHTMLAttributes } from "react";
import { InputProps, Input } from "./Input";
import { AsYouType } from 'libphonenumber-js'



const PhoneInput: SFC<InputProps & {
    onPhoneNumberChange: (number: string) => string
}> = (props) => {
    const {type, onChange, onPhoneNumberChange, ...other} = props;
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onPhoneNumberChange(new AsYouType().input(e.currentTarget.value))
    }
    return (
        <Input {...other} type="tel" onChange={handleChange} />
    )
}

export default PhoneInput;
