import theme from "../../styles/theme"
import React, { FunctionComponent } from "react"
import useTheme from "../../src/hooks/useTheme";


const FormGroup:FunctionComponent = ({children}) => {
    const theme = useTheme();
    return <div style={{marginBottom: `${theme.spacing(2)}px`}}>{children}</div>
}

export default FormGroup;