import { CONTACT_EMAIL, SHOW_CV_DOWNLOAD } from "$env/static/private";
import { encodeEmail } from "$lib/email-obfuscation";
import type { PageServerLoad } from "./$types";

/* Runs only at build time (the page is prerendered), so the plain address never
   reaches the client bundle: the page receives the encoded form alone. */
export const load: PageServerLoad = () => {
	if (!CONTACT_EMAIL) {
		throw new Error("CONTACT_EMAIL is empty: set it in .env locally, or as a repository secret for CI.");
	}
	return {
		encodedEmail: encodeEmail(CONTACT_EMAIL),
		/* opt-in: the CV PDFs are always published, but only linked when this is "true" */
		showCvDownload: SHOW_CV_DOWNLOAD === "true",
	};
};
