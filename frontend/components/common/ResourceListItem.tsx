import React from "react";
import { CheckCircle, Circle, Key, Lock, Unlock, User } from "react-feather";
import { useTranslation } from "../../localization";
import Resource from "../../src/model/api/Resource";
import { notEmpty } from "../../src/util/TypeUtil";
import theme from "../../styles/theme";
import FormMultilineValue from "../FormMultilineValue";
import Divider from "./Divider";
import FormElement from "./FormElement";
import FormElementBase from "./FormElementBase";
import { LoadingInline } from "./Loading";

interface ResourceListItemProps {
    resource: Resource;
    selected?: boolean;
    onSelect?: (selected: boolean) => void;
    last?: boolean;
    showMeta?: boolean;
}

const ResourceListItem: React.FunctionComponent<ResourceListItemProps> = ({
    resource,
    selected,
    onSelect,
    last,
    showMeta,
}) => {
    const { t } = useTranslation();
    const handleSelect = () => {
        onSelect?.(!selected);
    };

    return (
        <>
            <style jsx>{`
                li {
                    margin: 0;
                    padding: 0;
                }

                .icon {
                    flex: 0 0 ${theme.spacing(5)}px;
                }

                .icon.right {
                    flex: 0 0 ${theme.spacing(4)}px;
                    text-align: right;
                    margin-right: ${-theme.spacing(0)}px;
                    color: ${theme.disabledColor};
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                }

                .capacity {
                    text-transform: uppercase;
                    font-size: 0.75rem;
                    font-weight: normal;
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                }

                .capacity :global(svg) {
                    margin-left: ${theme.spacing(0.5)}px;
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
                componentType="li"
            >
                {notEmpty(selected) && (
                    <span className="icon left">
                        {selected ? (
                            <CheckCircle strokeWidth={2} />
                        ) : (
                            <Circle strokeWidth={2} />
                        )}
                    </span>
                )}
                <FormMultilineValue
                    value={[resource.name, resource.display_numbers || ""]}
                />
                {showMeta && (
                    <span className="icon right">
                        {resource.access_restricted && (
                            <span>
                                <Key strokeWidth={1} />
                            </span>
                        )}
                        {resource.capacity && (
                            <span className="capacity">
                                {resource.capacity}{" "}
                                <User width={12} height={12} />
                            </span>
                        )}
                    </span>
                )}
            </FormElementBase>
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
            <div>
                <LoadingInline loading={true} />
            </div>
        </>
    );
};

export default ResourceListItem;
