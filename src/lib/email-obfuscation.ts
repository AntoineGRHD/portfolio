/*
 * Keeps the contact address out of the page as text: the build encodes it to a list
 * of numbers and the browser decodes it only when someone asks to see it. It stops
 * scrapers that pattern-match addresses in HTML, nothing more determined than that.
 */
const key = 73;

export function encodeEmail(email: string): number[] {
	return [...email].map((char) => char.charCodeAt(0) * key);
}

export function decodeEmail(codes: readonly number[]): string {
	return codes.map((code) => String.fromCharCode(code / key)).join("");
}
