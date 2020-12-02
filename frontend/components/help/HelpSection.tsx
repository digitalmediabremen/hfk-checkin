import * as React from "react";
import SmoothCollapse from "react-smooth-collapse";
import theme from "../../styles/theme";
import { Button } from "../common/Button";
import Subtitle from "../common/Subtitle";

interface HelpSectionProps {
    open?: boolean;
    onOpen?: (open: boolean) => void;
    title: string;
}

const scrollIntoView = (element: HTMLInputElement) => {
    const headerOffset = 80;
    const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - headerOffset;

    window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
    });
};

export const useOnlyOneOpen = (
    enabled: boolean = true
): ((index: number) => Pick<HelpSectionProps, "open" | "onOpen">) => {
    const [openId, setOpenId] = React.useState<number | undefined>(undefined);
    return (index: number) => {
        if (!enabled) return {};
        const isOpen = () => openId === index;
        const onFold = (open: boolean) => setOpenId(open ? index : undefined);
        return {
            onOpen: onFold,
            open: isOpen(),
        };
    };
};

const HelpTitle: React.FunctionComponent = ({ children }) => {
    return (
        <>
            <style jsx>{`
                h3 {
                    padding: ${theme.spacing(1)}px;
                    border: 2px solid ${theme.primaryColor};
                    border-radius: ${theme.borderRadius}px;
                    margin: 0 -${theme.spacing(1)}px ${theme.spacing(2)}px -${theme.spacing(
                            1
                        )}px;
                    font-weight: "bold";
                    font-size: 1em;
                    color: ${theme.primaryColor};
                }

                h3:hover {
                    cursor: pointer;
                    background-color: ${theme.primaryColor};
                    color: #fff;
                }
            `}</style>
            <div>
                <h3>{children}</h3>
            </div>
        </>
    );
};

const HelpSection: React.FunctionComponent<HelpSectionProps> = (props) => {
    const ref = React.useRef<HTMLInputElement>(null);
    const [_open, setOpen] = React.useState(false);
    const open = props.open !== undefined ? props.open : _open;
    const { title: sectionTitle, children, onOpen: onFold } = props;

    const handleClick = () => {
        setOpen(!open);
        if (onFold !== undefined) onFold(!open);
    };

    const handleExpanded = () => {
        if (!open) return;
        if (!ref.current) return;
        scrollIntoView(ref.current);
    };

    return (
        <>
            <style jsx>{`
                div {
                }
            `}</style>
            <div ref={ref} onClick={handleClick}>
                <HelpTitle>{sectionTitle}</HelpTitle>
            </div>
            <SmoothCollapse
                heightTransition="0.2s ease"
                eagerRender={true}
                onChangeEnd={handleExpanded}
                expanded={open}
            >
                {children}
            </SmoothCollapse>
        </>
    );
};

export default HelpSection;