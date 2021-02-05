
type FeatureNames = ["checkin", "getin"];
type BooleanMapFromArray<T extends readonly string[]> = {
    [K in T[number]]: readonly boolean
}

const featureMap:readonly BooleanMapFromArray<FeatureNames> = {};

export default featureMap;
export function getHomeUrl(): string;
export function getPrimaryColor(): string;
export function getManifestUrl(): string;