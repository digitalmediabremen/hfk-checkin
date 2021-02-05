function envToBoolean(envvar) {
    if (envvar === undefined) return false;
    if (!["1", "0"].includes(envvar)) throw "env variable must be 0 or 1";
    if (envvar === "0") return false;
    return true;
}

const features = {
    checkin: envToBoolean(process.env.NEXT_PUBLIC_FEATURE_CHECKIN),
    getin: envToBoolean(process.env.NEXT_PUBLIC_FEATURE_GETIN),
};

function getHomeUrl () {
    if (features.checkin) return "/checkin";
    if (features.getin) return "/request";
    return "/";
};

function getPrimaryColor() {
    if (features.checkin) return "rgba(216, 24, 48, 100)";
    if (features.getin) return "rgba(0,0,255, 100)";
    return "rgba(0, 24, 48, 100)";
}

function getManifestUrl() {
    if (features.checkin && !features.getin) return "/manifest.checkin.json";
    if (features.getin && !features.checkin) return "/manifest.getin.json";
    return "/manifest.json";
}

module.exports = features;
module.exports.getPrimaryColor = getPrimaryColor;
module.exports.getHomeUrl = getHomeUrl;
module.exports.getManifestUrl = getManifestUrl;
