import React from "react";
import { CheckCircle, Circle, Key, Lock, Unlock } from "react-feather";
import Resource from "../../src/model/api/Resource";
import theme from "../../styles/theme";
import FormMultilineValue from "../FormMultilineValue";
import Divider from "./Divider";
import FormElement from "./FormElement";
import FormElementBase from "./FormElementBase";
import { LoadingInline } from "./Loading";

interface ResourceListItemProps {
    resource: Resource;
    selected?: boolean;
    onSelect: (selected: boolean) => void;
    last?: boolean;
}

const ResourceListItem: React.FunctionComponent<ResourceListItemProps> = ({
    resource,
    selected,
    onSelect,
    last,
}) => {
    const handleSelect = () => {
        onSelect?.(!selected);
    };

    return (
        <>
            <li>
                <style jsx>{`
                    li {
                        margin: 0;
                        padding: 0 ${theme.spacing(1.5)}px;
                        height: ${theme.spacing(7)}px;
                        display: flex;
                        align-items: center;
                        color: ${theme.primaryColor};
                        width: 100%;
                    }

                    .icon {
                        flex: 0 0 ${theme.spacing(5)}px;
                    }

                    .icon.right {
                        text-align: right;
                        margin-right: ${-theme.spacing(0)}px;
                        color: ${theme.disabledColor};
                    }

                    .icon.left {
                        text-align: left;
                        margin-left: ${-theme.spacing(0)}px;
                    }
                    .text {
                        flex: 1;
                    }
                `}</style>
                <FormElementBase
                    noOutline
                    noBottomSpacing
                    onClick={handleSelect}
                >
                    <span className="icon left">
                        {selected ? (
                            <CheckCircle strokeWidth={2} />
                        ) : (
                            <Circle strokeWidth={2} />
                        )}
                    </span>
                    <div className="text">
                        <FormMultilineValue
                            value={[
                                resource.name,
                                resource.display_numbers || "",
                            ]}
                        />
                    </div>
                    {resource.access_restricted && (
                        <span className="icon right">
                            <Key strokeWidth={1} />
                        </span>
                    )}
                </FormElementBase>
            </li>
            {!last && <Divider noSpacing />}
        </>
    );
};

export const LoadingListItem: React.FunctionComponent<{}> = () => {
    return (
        <>
            <style jsx>{`
                div {
                    height: 100%;
                }
            `}</style>
            <div>{/* <LoadingInline loading={true} /> */}</div>
        </>
    );
};

export default ResourceListItem;
