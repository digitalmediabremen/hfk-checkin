import React from "react";
import {
    CheckCircle,
    Circle,
    Key,
    Lock,
    Unlock,
    User,
    UserPlus,
    Users,
} from "react-feather";
import { useTranslation } from "../../localization";
import Resource from "../../src/model/api/Resource";
import { notEmpty } from "../../src/util/TypeUtil";
import useTheme from "../../src/hooks/useTheme";
import FormMultilineValue from "../FormMultilineValue";
import Divider from "./Divider";
import FormElement from "./FormElement";
import FormElementBase from "./FormElementBase";
import { LoadingInline } from "./Loading";
import classNames from "classnames";
import { resourcePermissionIcon } from "../../src/util/ReservationPresenterUtil";

interface ResourceListItemProps {
    resource: Resource;
    selected?: boolean;
    onSelect?: (selected: boolean) => void;
    last?: boolean;
    showMeta?: boolean;
    includeAlternativeNames?: boolean;
}

const ResourceListItem: React.FunctionComponent<ResourceListItemProps> = ({
    resource,
    selected,
    onSelect,
    last,
    showMeta,
    includeAlternativeNames
}) => {
    const theme = useTheme();
    const { t } = useTranslation("request-resource-list");
    const handleSelect = () => {
        onSelect?.(!selected);
    };

    const PermissionIcon = resourcePermissionIcon(resource);

    return (
        <div className="wrapper">
            <style jsx>{`
                .wrapper {
                    max-width: ${theme.desktopWidth}px;
                    margin: 0 auto;
                }
                li {
                    margin: 0;
                    padding: 0;
                }
                .icon {
                    flex: 0 0 ${theme.spacing(5)}px;
                    line-height: 0;
                }

                .icon.right {
                    flex: 1;
                    // flex: 1 0 ${theme.spacing(8)}px;
                    margin-right: ${-theme.spacing(0)}px;
                    margin-left: auto;
                    color: ${theme.primaryColor};
                    flex-direction: row;
                    align-items: center;
                    text-align: right;
                    white-space: nowrap;
                }

                .icon.left {
                    text-align: left;
                    margin-left: ${-theme.spacing(0)}px;
                }

                .meta-element {
                    margin-right: ${theme.spacing(2)}px;
                }

                .meta-element:last-child {
                    margin-right: 0;
                }

                .meta-element > :global(svg) {
                    vertical-align: text-bottom;
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
                    value={[
                        resource.display_numbers || "",
                        <span>
                            <b>{resource.name}</b>
                            {includeAlternativeNames && resource.alternative_names &&(<i>{" "}{resource.alternative_names.join(",")}</i>)}
                        </span>,
                    ]}
                />

                <span className="icon right">
                    {resource.access_restricted && (
                        <span className={classNames("meta-element")}>
                            <PermissionIcon
                                strokeWidth={(1 / 20) * 24}
                                height={20}
                                width={18}
                                preserveAspectRatio="none"
                            />
                        </span>
                    )}
                    {resource.capacity && showMeta && (
                        <span className="meta-element">
                            {resource.capacity}{" "}
                            <Users strokeWidth={1} size={20} />
                        </span>
                    )}
                </span>
            </FormElementBase>
            {!last && <Divider noSpacing />}
        </div>
    );
};

export const LoadingListItem: React.FunctionComponent<{ index?: number }> = ({
    index,
}) => {
    const theme = useTheme();
    return (
        <>
            <style jsx>{`
                div {
                    height: 100%;
                    display: flex;
                    align-items: center;
                    text-align: center;
                    justify-content: center;
                    animation: load 0.5s infinite alternate;
                    animation-delay: ${((index || 0) % 10) / 10}s;
                }

                @keyframes load {
                    from {
                        background-color: ${theme.shadePrimaryColor(0)};
                    }
                    to {
                        background-color: ${theme.shadePrimaryColor(0.1)};
                    }
                }
            `}</style>
            <div />
            <Divider noSpacing />
        </>
    );
};

export default ResourceListItem;
