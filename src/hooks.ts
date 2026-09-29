import { deLocalizeUrl } from '$codegen/paraglide/runtime';

export const reroute = (request) => deLocalizeUrl(request.url).pathname;
