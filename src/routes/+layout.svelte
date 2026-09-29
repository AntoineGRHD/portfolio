<script lang="ts">
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
</script>

<div class="page">
	{@render children()}
</div>

<style lang="scss">
	/* Latin subsets of the three weights in use. Medium stands in for 400 and Bold for
	   800, so the lighter and heavier requests resolve to real faces, never synthesized ones. */
	@font-face {
		font-family: 'Poppins';
		src: url('/fonts/Poppins-Medium.woff2') format('woff2');
		font-weight: 500;
		font-style: normal;
		font-display: swap;
	}

	@font-face {
		font-family: 'Poppins';
		src: url('/fonts/Poppins-SemiBold.woff2') format('woff2');
		font-weight: 600;
		font-style: normal;
		font-display: swap;
	}

	@font-face {
		font-family: 'Poppins';
		src: url('/fonts/Poppins-Bold.woff2') format('woff2');
		font-weight: 700;
		font-style: normal;
		font-display: swap;
	}

	:global(:root) {
		--accent-orange: #ee8c0f;
		/* the orange counterpart of --accent-blue-light: lifted and desaturated the
		   same way, so the two read as a pair when they share a row */
		--accent-orange-light: #eac086;
		--accent-blue: #55b3b2;
		/* the tint the skill chips read in — quiet enough to mark state in the nav */
		--accent-blue-light: #a4cfce;
		--page-bg: #050505;
		--section-bg: var(--page-bg);
		--surface-bg: #101010;
		--surface-bg-muted: #0a0a0a;

		/* The divider ladder, lightest last: the section marker's tick run, then
		   the band between blocks — a subsection in 01, an entry everywhere else
		   — then a hairline for anything nested inside a block. The band is a
		   token rather than a class because the components drawing it are scoped
		   apart. `--rule-item` is the plain hairline for box edges, not a level. */
		--rule-band: repeating-linear-gradient(
			118deg,
			transparent 0 4px,
			rgba(255, 255, 255, 0.2) 4px 5px,
			transparent 5px 8px
		);
		--rule-band-height: 6px;
		/* the run dies out at both ends rather than being cut off square */
		--rule-band-fade: linear-gradient(
			to right,
			transparent 0,
			#000 56px,
			#000 calc(100% - 56px),
			transparent 100%
		);
		--rule-nested: rgba(255, 255, 255, 0.07);
		--rule-item: rgba(255, 255, 255, 0.14);

		/* The page scale. Every shared measure lives here so one table covers the
		   whole range, phone to 2K, instead of five sections repeating the same
		   breakpoints. Grid and type step together: the column only widens as far
		   as the type grows, so line length stays where it was tuned. */
		--page-column: 1040px;
		--page-gutter: 64px;
		--section-space: 64px;
		--section-tail: 64px;
		/* the last section closes the page, so it keeps a deeper tail */
		--page-tail: 80px;

		--role-rail: 210px;
		--role-gap: 36px;

		/* Eight steps, each with one job: display, section title, the current-role
		   lead, h3, h4, body, secondary, and the uppercase caption voice. Nothing
		   on the page sets a size outside this set. */
		--fs-display: 44px;
		--fs-title: 32px;
		--fs-lead: 24px;
		--fs-subtitle: 20px;
		--fs-heading: 18px;
		--fs-body: 16px;
		--fs-small: 14px;
		--fs-caption: 12px;
		--marker-tick: 17px;

		--stamp-start: 22px;
		--stamp-end: 13px;
		--stamp-elbow: 24px;
	}

	/* narrower gutters before the two-column rail collapses */
	@media (max-width: 799px) {
		:global(:root) {
			--page-gutter: 32px;
		}
	}

	@media (max-width: 639px) {
		:global(:root) {
			--page-gutter: 18px;
			--section-space: 48px;
			--section-tail: 52px;
			--page-tail: 60px;
			--fs-display: 36px;
			--fs-title: 28px;
			--fs-lead: 21px;
			--fs-subtitle: 18px;
			--fs-heading: 17px;
			--fs-body: 15px;
			--fs-small: 13px;
			--fs-caption: 12px;
			--marker-tick: 14px;
			--stamp-start: 19px;
		}
	}

	@media (min-width: 1920px) {
		:global(:root) {
			--page-column: 1200px;
			--page-gutter: 80px;
			--section-space: 76px;
			--section-tail: 76px;
			--page-tail: 92px;
			--role-rail: 230px;
			--role-gap: 40px;
			--fs-display: 52px;
			--fs-title: 37px;
			--fs-lead: 27px;
			--fs-subtitle: 22px;
			--fs-heading: 19px;
			--fs-body: 17px;
			--fs-small: 15px;
			--fs-caption: 13px;
			--marker-tick: 19px;
			--stamp-start: 24px;
			--stamp-end: 14px;
			--stamp-elbow: 28px;
		}
	}

	@media (min-width: 2560px) {
		:global(:root) {
			--page-column: 1320px;
			--page-gutter: 96px;
			--section-space: 88px;
			--section-tail: 88px;
			--page-tail: 104px;
			--role-rail: 250px;
			--role-gap: 44px;
			--fs-display: 60px;
			--fs-title: 42px;
			--fs-lead: 30px;
			--fs-subtitle: 24px;
			--fs-heading: 21px;
			--fs-body: 18px;
			--fs-small: 16px;
			--fs-caption: 14px;
			--marker-tick: 21px;
			--stamp-start: 26px;
			--stamp-end: 15px;
			--stamp-elbow: 32px;
		}
	}

	:global(html),
	:global(body) {
		padding: 0;
		margin: 0;
		height: 100%;
		width: 100%;
	}

	:global(html) {
		font-family: 'Poppins', sans-serif;
		font-weight: 400;
		font-style: normal;
	}

	:global(body) {
		background: var(--page-bg);
	}

	.page {
		position: relative;
		width: 100%;
		min-height: 100vh;
		min-height: 100svh;
		overflow-x: hidden;
	}

	/* mobile docks the bottom nav in flow, so the page becomes a fixed-height
	   column and the content area below becomes the scroll container */
	@media (max-width: 639px) {
		.page {
			height: 100svh;
			min-height: 0;
			display: flex;
			flex-direction: column;
			overflow: hidden;
		}
	}

</style>
