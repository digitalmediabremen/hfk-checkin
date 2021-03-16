import Link from "next/link";
import React from "react";
import { PlusCircle } from "react-feather";
import { appUrls } from "../../config";

interface NewRequestButtonProps {}

const NewRequestButton: React.FunctionComponent<NewRequestButtonProps> = ({}) => {
    return (
        <>
            <style jsx>{``}</style>
            <Link href={appUrls.request}>
                <a>
                    <PlusCircle size={40} strokeWidth={(2 / 40) * 24} />
                </a>
            </Link>
        </>
    );
};

export default NewRequestButton;
