
type FeatureNames = ["checkin", "getin"];
type BooleanMapFromArray<T extends readonly string[]> = {
    [K in T[number]]: readonly boolean
}

const featureMap:readonly BooleanMapFromArray<FeatureNames> = {};

export default featureMap;
export function getHomeUrl(): string;
export function getPrimaryColor(colorScheme: "light" | "dark"): string;
export function getManifestUrl(): string;
export function envToBoolean(value?: string): boolean;
export function getTitle(): string;
export function getPrimaryColorHex(colorScheme: "light" | "dark"): string;
export function getName(): string;