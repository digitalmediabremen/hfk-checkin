import { SFC } from "react";
import { InputProps, Input } from "./Input";
import NumberFormat from 'react-number-format';



const PhoneInput: SFC<InputProps> = (props) => {
    return (
        <NumberFormat {...props} customInput={Input} format="#### ########" mask=" "/>
    )
}

export default PhoneInput;
