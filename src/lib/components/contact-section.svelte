<script lang="ts">
	import { onDestroy } from "svelte";
	import Check from "@lucide/svelte/icons/check";
	import Copy from "@lucide/svelte/icons/copy";
	import Mail from "@lucide/svelte/icons/mail";
	import MapPin from "@lucide/svelte/icons/map-pin";
	import { m } from "$codegen/paraglide/messages.js";
	import { decodeEmail } from "$lib/email-obfuscation";
	import SectionMarker from "$lib/components/section-marker.svelte";

	type EmailPart = {
		id: number;
		char: string;
		order: number;
	};

	/* encoded at build time from CONTACT_EMAIL, see +page.server.ts */
	let { encodedEmail }: { encodedEmail: readonly number[] } = $props();

	let copyTimer: ReturnType<typeof setTimeout> | undefined;
	let email = $state<string | null>(null);
	let displayParts = $state<EmailPart[]>([]);
	let copied = $state(false);

	function scrambleEmail(value: string): EmailPart[] {
		return [...value]
			.map((char, order) => ({ id: order, char, order }))
			.sort((a, b) => (a.order * 7) % value.length - (b.order * 7) % value.length);
	}

	function reveal() {
		const decodedEmail = decodeEmail(encodedEmail);
		email = decodedEmail;
		displayParts = scrambleEmail(decodedEmail);
		copied = false;
	}

	function copyWithSelectionFallback(value: string) {
		const buffer = document.createElement("textarea");
		buffer.value = value;
		buffer.setAttribute("readonly", "");
		buffer.className = "copy-buffer";
		document.body.appendChild(buffer);
		buffer.select();
		const didCopy = document.execCommand("copy");
		buffer.remove();

		return didCopy;
	}

	async function copyEmail() {
		const decodedEmail = email ?? decodeEmail(encodedEmail);
		let didCopy: boolean;

		try {
			await navigator.clipboard.writeText(decodedEmail);
			didCopy = true;
		} catch {
			didCopy = copyWithSelectionFallback(decodedEmail);
		}

		if (!didCopy) {
			return;
		}

		copied = true;

		if (copyTimer) {
			clearTimeout(copyTimer);
		}

		copyTimer = setTimeout(() => {
			copied = false;
		}, 1800);
	}

	onDestroy(() => {
		if (copyTimer) {
			clearTimeout(copyTimer);
		}
	});
</script>

<section class="contact" id="contact">
	<span class="mail-decoy" aria-hidden="true">antoine.gourhand@example.invalid</span>

	<div class="section-inner">
		<SectionMarker index="05" />

		<header class="section-header">
			<h2>{m.contact_title()}</h2>
		</header>

		<div class="contact-row">
			{#if email}
				<p class="mail-line">
					<Mail size={16} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" />
					<span class="email" aria-hidden="true">
						{#each displayParts as part (part.id)}
							<span style:order={part.order}>{part.char}</span>
						{/each}
					</span>
					<span class="line-divider" aria-hidden="true"></span>
					<button class="control" type="button" onclick={copyEmail}>
						{#if copied}
							<Check size={14} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" />
						{:else}
							<Copy size={14} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" />
						{/if}
						<span>{copied ? m.contact_copied() : m.contact_copy()}</span>
					</button>
				</p>
			{:else}
				<button class="mail-line reveal" type="button" onclick={reveal}>
					<Mail size={16} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" />
					<span>{m.contact_reveal()}</span>
				</button>
			{/if}

			<p class="location">
				<MapPin size={14} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" />
				<span>{m.contact_location()}</span>
			</p>
		</div>
	</div>
</section>

<style lang="scss">
	.contact {
		background: var(--section-bg);
		color: white;
		padding: var(--section-space) var(--page-gutter) var(--page-tail);
	}

	.mail-decoy {
		position: absolute;
		width: 1px;
		height: 1px;
		clip-path: inset(50%);
		overflow: hidden;
		white-space: nowrap;
	}

	:global(.copy-buffer) {
		position: fixed;
		top: 0;
		left: 0;
		width: 1px;
		height: 1px;
		opacity: 0;
		pointer-events: none;
	}

	.section-inner {
		width: min(var(--page-column), 100%);
		margin: 0 auto;
	}

	.section-header {
		margin-bottom: 34px;

		h2 {
			margin: 0;
			font-size: var(--fs-title);
			font-weight: 700;
			line-height: 1.1;
			letter-spacing: 0;
		}
	}

	.contact-row {
		display: grid;
		justify-items: start;
		gap: 18px;
	}

	/* One class for both states, so the slot cannot change size when it is
	   clicked: the label and the address it becomes are set identically. */
	.mail-line {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 10px 14px;
		margin: 0;
		padding: 0;
		border: 0;
		background: transparent;
		color: white;
		font-family: inherit;
		font-size: var(--fs-body);
		font-weight: 600;
		/* 1, so the text box is the em box and matches the 16px glyph exactly —
		   with leading on it the two centre on different things */
		line-height: 1;
		text-align: left;
	}

	.reveal {
		color: var(--accent-orange-light);
		cursor: pointer;
		transition: color 0.2s ease;

		&:hover,
		&:focus-visible {
			color: var(--accent-orange);
		}

		&:focus-visible {
			outline: 2px solid rgba(238, 140, 15, 0.35);
			outline-offset: 3px;
		}
	}

	.email {
		display: inline-flex;
		cursor: default;
		user-select: none;

		span {
			display: inline-block;
		}
	}

	/* the page's control voice: no box, an icon and an uppercase label */
	.control {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--accent-orange-light);
		cursor: pointer;
		font-family: inherit;
		font-size: var(--fs-caption);
		font-weight: 600;
		/* 1, so this control never exceeds the 16px address line and re-centres
		   everything on it — that is what made the two states sit differently */
		line-height: 1;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		transition: color 0.2s ease;

		&:hover,
		&:focus-visible {
			color: var(--accent-orange);
		}

		&:focus-visible {
			outline: 2px solid rgba(238, 140, 15, 0.35);
			outline-offset: 3px;
		}
	}

	.location {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		margin: 0;
		color: rgba(255, 255, 255, 0.5);
		font-size: var(--fs-caption);
		font-weight: 600;
		line-height: 1.5;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.line-divider {
		width: 1px;
		/* short of the line, so it parts the two rather than setting their height */
		height: 13px;
		background: var(--rule-item);
	}

	.contact-row :global(svg) {
		display: block;
		flex: 0 0 auto;
	}

	.mail-line > :global(svg) {
		/* boxes are equal now, so centring is the whole alignment — no nudge */
		align-self: center;
	}

	/* the revealed line is a <p>, so its glyph is decoration and stays quiet;
	   the reveal <button>'s glyph inherits the control colour instead */
	p.mail-line > :global(svg) {
		color: rgba(255, 255, 255, 0.42);
	}
</style>
