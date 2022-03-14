import Resource from "../model/api/Resource";

import slugify from "slugify";


export function normalizeResourceName(resource: Resource) {
    const slug = slugify(resource.name);

    if (!!slug) return slug;

    if (!slug && !!resource.display_numbers) {
        const numberSlug = slugify(resource.display_numbers);
        if (!!numberSlug) return numberSlug
    }
    return "no-room-name";
}