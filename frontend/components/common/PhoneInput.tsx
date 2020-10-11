import { SFC } from "react";
import { InputProps, Input } from "./Input";
import NumberFormat from 'react-number-format';



const PhoneInput: SFC<InputProps> = (props) => {
    return (
        <NumberFormat {...props} placeholder="+(49) 1573 0000000" customInput={Input} format="+(##) #### #######" mask=" "/>
    )
}

export default PhoneInput;
