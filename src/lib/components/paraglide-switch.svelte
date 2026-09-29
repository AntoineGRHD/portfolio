<script lang="ts">
	import { m } from "$codegen/paraglide/messages.js";
	import { getLocale, setLocale } from "$codegen/paraglide/runtime.js";

	/* Both choices stay on screen; the one you are reading in carries the weight.
	   Endonyms as the accessible names — a language names itself the same way in
	   every locale, so they are not translated. */
	const locales = [
		{ code: "en", name: "English" },
		{ code: "fr", name: "Français" },
	] as const;

	/* the switch renders twice (top bar, mobile hero), so the clip id must not collide */
	const uid = $props.id();
	const clipId = `union-counterchange-${uid}`;
</script>

<div class="locale-switch" role="group" aria-label={m.locale_switch_label()}>
	{#each locales as locale (locale.code)}
		<button
			type="button"
			class:active={getLocale() === locale.code}
			aria-current={getLocale() === locale.code ? "true" : undefined}
			aria-label={locale.name}
			onclick={() => setLocale(locale.code)}
		>
			{#if locale.code === "en"}
				<!-- drawn rather than an emoji flag: those fall back to bare letters on Windows -->
				<svg class="flag" viewBox="0 0 60 40" aria-hidden="true">
					<clipPath id={clipId}>
						<path d="M30,20 h30 v20 z v20 h-30 z h-30 v-20 z v-20 h30 z" />
					</clipPath>
					<path d="M0,0 h60 v40 h-60 z" fill="#00247d" />
					<path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" stroke-width="8" />
					<path
						d="M0,0 L60,40 M60,0 L0,40"
						clip-path="url(#{clipId})"
						stroke="#cf142b"
						stroke-width="5"
					/>
					<path d="M30,0 v40 M0,20 h60" stroke="#fff" stroke-width="13" />
					<path d="M30,0 v40 M0,20 h60" stroke="#cf142b" stroke-width="8" />
				</svg>
			{:else}
				<svg class="flag" viewBox="0 0 3 2" aria-hidden="true">
					<path d="M0,0 h1 v2 h-1 z" fill="#002654" />
					<path d="M1,0 h1 v2 h-1 z" fill="#fff" />
					<path d="M2,0 h1 v2 h-1 z" fill="#ed2939" />
				</svg>
			{/if}
			<span>{locale.code}</span>
		</button>
	{/each}
</div>

<style lang="scss">
	.locale-switch {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		/* holds its width wherever it is placed, rather than being squeezed */
		flex: 0 0 auto;
	}

	/* wears the nav link's clothes, so it sits in the bar rather than on it */
	button {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 10px 10px;
		border: 0;
		background: transparent;
		color: rgba(255, 255, 255, 0.55);
		cursor: pointer;
		font-family: inherit;
		font-size: var(--fs-small);
		font-weight: 700;
		line-height: 1;
		text-transform: uppercase;
		transition: color 0.25s ease;

		&:hover {
			color: white;
		}

		/* white, not the nav's blue — blue means "the section you are in", and the
		   two states should not read as the same thing */
		&.active {
			color: white;
		}
	}

	.flag {
		display: block;
		width: 18px;
		height: 12px;
		flex: 0 0 auto;
		/* the language you are not reading in recedes rather than disappears */
		opacity: 0.68;
		filter: grayscale(0.3);
		transition: opacity 0.25s ease, filter 0.25s ease;
	}

	button:hover .flag,
	button.active .flag {
		opacity: 1;
		filter: none;
	}

	button:focus-visible {
		outline: 2px solid rgba(85, 179, 178, 0.3);
		outline-offset: -4px;
	}

	@media (max-width: 899px) {
		button {
			padding: 8px 9px;
			font-size: var(--fs-caption);
		}

		.flag {
			width: 16px;
			height: 11px;
		}
	}
</style>
