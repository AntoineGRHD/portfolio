import { CONTACT_EMAIL } from "$env/static/private";
import { encodeEmail } from "$lib/email-obfuscation";
import type { PageServerLoad } from "./$types";

/* Same as the home page: the address only leaves the build encoded, and the CV
   decodes it in the browser, where scripts/build-cv.mjs prints it. */
export const load: PageServerLoad = () => {
	if (!CONTACT_EMAIL) {
		throw new Error("CONTACT_EMAIL is empty: set it in .env locally, or as a repository secret for CI.");
	}
	return { encodedEmail: encodeEmail(CONTACT_EMAIL) };
};
