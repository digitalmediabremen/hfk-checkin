import classNames from "classnames";
import React, { ReactNode } from "react";
import {
    AlertCircle,
    AlertOctagon,
    AlertTriangle,
    Circle,
} from "react-feather";
import useTheme from "../../src/hooks/useTheme";
import {
    ValidationContext,
    ValidationLevel,
    ValidationObject,
    ValidationType,
} from "../../src/model/api/NewReservationValidationFixLater";
import { getValidationLevelIcon } from "../../src/util/ReservationValidationUtil";
import { useAppState } from "./AppStateProvider";
import FormText from "./FormText";

interface ValidationMessage {
    title: string;
    level?: ValidationLevel;
    bottomSpacing?: number;
}

const ValidationMessage: React.FunctionComponent<ValidationMessage> = ({
    title,
    children,
    level,
    bottomSpacing,
}) => {
    const theme = useTheme();

    const IconComponent = getValidationLevelIcon(level);

    return (
        <div className={classNames("validation-wrapper")}>
            {IconComponent && (
                <span className="icon">
                    <IconComponent />
                </span>
            )}

            <div className="content">
                {title && <h3>{title}</h3>}
                {children && <FormText bottomSpacing={0}>{children}</FormText>}
            </div>
            <style jsx>{`
                .validation-wrapper {
                    display: flex;
                    color: ${theme.primaryColor};
                    margin-bottom: ${theme.spacing(bottomSpacing || 0)}px;
                }

                h3 {
                    font-size: 1rem;
                    margin: 0;
                    padding: 0;
                    margin-bottom: ${theme.spacing(1)}px;
                }

                .icon {
                    flex: 0 0 ${theme.spacing(5)}px;
                    line-height: 0px;
                }

                .content {
                    width: 100%;
                    margin-top: ${theme.spacing(0.25)}px;
                    flex: 1;
                    width: calc(100% - ${theme.spacing(5)}px);
                }
            `}</style>
        </div>
    );
};

interface ValidationResultProps {
    filter?: (object: ValidationObject) => boolean;
    children?: (object: ValidationObject) => ReactNode;
}

const ValidationResult: React.FunctionComponent<ValidationResultProps> = ({
    filter,
    children,
}) => {
    const { appState } = useAppState();
    const filtered = filter
        ? appState.reservationValidation.filter(filter)
        : appState.reservationValidation;
    return (
        <>
            {filtered.map((validationObject, index) => (
                <ValidationMessage
                    key={index}
                    bottomSpacing={2}
                    title={validationObject.detail}
                    level={validationObject.level}
                >
                    {children && children(validationObject)}
                </ValidationMessage>
            ))}
            <style jsx>{``}</style>
        </>
    );
};

export default ValidationResult;
