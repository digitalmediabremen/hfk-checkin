import React from "react";
import { Transition } from "react-transition-group";
import { TransitionStatus } from "react-transition-group/Transition";

interface FadeProps {
    in: boolean
}

const duration = 200;

const defaultStyle = {
    transition: `opacity ${duration}ms ease-in-out`,
    opacity: 0,
};

const transitionStyles: Partial<Record<TransitionStatus, {}>> = {
    entering: { opacity: 0 },
    entered: { opacity: 1 },
    exiting: { opacity: 0 },
    exited: { opacity: 0 },
};

const Fade: React.FunctionComponent<FadeProps> = ({ in: inProp, children }) => (
    <Transition in={inProp} timeout={duration} unmountOnExit >
        {(state) => (
            <div
                style={{
                    ...defaultStyle,
                    ...transitionStyles[state],
                }}
            >
                {children}
            </div>
        )}
    </Transition>
);

export default Fade;
