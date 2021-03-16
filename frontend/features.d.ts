
type FeatureNames = ["checkin", "getin"];
type BooleanMapFromArray<T extends readonly string[]> = {
    [K in T[number]]: readonly boolean
}

const featureMap:readonly BooleanMapFromArray<FeatureNames> = {};

export default featureMap;
export function getHomeUrl(): string;
export function getPrimaryColor(): string;
export function getManifestUrl(): string;
export function envToBoolean(value?: string): boolean;
export function getTitle(): string;
export function getPrimaryColorHex(): string;
export function getName(): string;