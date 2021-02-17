declare module "react-time-input-polyfill" {
    import React, { InputHTMLAttributes } from "react";
    declare interface ComponentProps extends InputHTMLAttributes<HTMLImageElement> {
        onChange: (o: { value: string; element: HTMLInputElement }) => void;
    }
    export default class TimeInput extends React.Component<
        ComponentProps,
        any
    > {}
}
