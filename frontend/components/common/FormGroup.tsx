import theme from "../../styles/theme"
import React, { SFC } from "react"


const FormGroup:SFC = ({children}) => {
    return <div style={{marginBottom: `${theme.spacing(2)}px`}}>{children}</div>
}

export default FormGroup;