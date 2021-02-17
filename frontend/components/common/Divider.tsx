import React from "react";
import theme from "../../styles/theme";

interface DividerProps { 
}

const Divider: React.FunctionComponent<DividerProps> = ({

}) => {
    return (
        <>
            <style jsx>{`
                hr {
                    border-top: 1px solid ${theme.primaryColor};
                    margin: ${theme.spacing(2)}px ${-theme.spacing(3)}px;
                }

                @media screen and (min-width: 500px) {
                    hr {
                        margin: ${theme.spacing(2)}px -50vw;
                    }
                }
            `}</style>
            <hr />
        </>
    );
};

export default Divider;