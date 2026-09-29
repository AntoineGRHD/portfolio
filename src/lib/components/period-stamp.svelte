<script lang="ts">
	import CornerDownRight from "@lucide/svelte/icons/corner-down-right";
	import MoveRight from "@lucide/svelte/icons/move-right";
	import { localize, splitPeriod, type LocalizedText } from "$data/experiences";

	/* Shifted period: the start carries the weight, an elbow drops from under it
	   and turns into the arrow that lands on the end date. */
	let {
		anchor,
		date,
		size = "regular",
	}: { anchor: string; date?: LocalizedText; size?: "regular" | "compact" } = $props();

	/* the anchor only stands in when no period was authored */
	const period = $derived(splitPeriod(localize(date) || anchor));

	/* two bare years don't earn a staircase — they run on one line instead */
	const flat = $derived(/^\d{4}$/.test(period.start) && /^\d{4}$/.test(period.end ?? ""));

	const ongoing = $derived(/^pr[eé]sent$/i.test(period.end ?? ""));

	/* lucide draws on a 24 grid — anything off its standard steps renders on half
	   pixels, so the icon gets a real size prop instead of being scaled by CSS */
	const iconSize = $derived(size === "compact" ? 20 : 24);
</script>

<div class="period-stamp {size}" class:flat class:ongoing>
	<span class="start">{period.start}</span>
	{#if period.end}
		<span class="run">
			<!-- both arrows ride along: which one shows is a breakpoint decision,
			     so it can't be settled here -->
			<span class="elbow" aria-hidden="true">
				<CornerDownRight class="turn" size={iconSize} strokeWidth={1.5} absoluteStrokeWidth />
				<MoveRight class="straight" size={iconSize} strokeWidth={1.5} absoluteStrokeWidth />
			</span>
			<span class="end">{period.end}</span>
		</span>
	{/if}
</div>

<style lang="scss">
	.period-stamp {
		--start-size: var(--stamp-start);
		--end-size: var(--stamp-end);
		--elbow-size: var(--stamp-elbow);
		--rule-fade: 0.45;

		display: grid;
		justify-items: start;
		align-content: start;
	}

	.start {
		color: white;
		font-size: var(--start-size);
		font-weight: 600;
		line-height: 1.05;
		text-transform: uppercase;
		letter-spacing: 0.015em;
		/* digits keep a common width so the stamps line up down the column */
		font-variant-numeric: tabular-nums;
		font-feature-settings: "tnum" 1;
	}

	/* the second step, indented so the end date lands well right of the start */
	.run {
		display: flex;
		align-items: flex-end;
		gap: 5px;
		margin-left: 34px;
	}

	.elbow {
		display: block;
		/* the head is a separate path crossing the line, so a translucent stroke
		   double-composites at the tip — fading the whole icon keeps it even */
		color: white;
		opacity: var(--rule-fade);

		/* the icon keeps its own proportions, so the arrow sits 37.5% of its height
		   up from the bottom — this drops it back onto the end date's mid-height */
		margin-bottom: calc(var(--end-size) / 2 - var(--elbow-size) * 0.375);

		:global(svg) {
			display: block;
		}

		:global(.straight) {
			display: none;
		}
	}

	.end {
		color: rgba(255, 255, 255, 0.5);
		font-size: var(--end-size);
		font-weight: 600;
		line-height: 1;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-variant-numeric: tabular-nums;
		font-feature-settings: "tnum" 1;
	}

	/* a role still running reads as live rather than closed */
	.ongoing {
		--rule-fade: 0.65;

		.end {
			color: var(--accent-orange-light);
		}
	}

	/* one line: a straight arrow, both years at the same scale, since neither one
	   is more precise than the other */
	@mixin one-line {
		grid-auto-flow: column;
		justify-content: start;
		align-items: center;
		gap: 10px;

		.run {
			align-items: center;
			gap: 10px;
			margin-left: 0;
		}

		.elbow {
			margin-bottom: 0;
		}

		.elbow :global(.turn) {
			display: none;
		}

		.elbow :global(.straight) {
			display: block;
		}
	}

	.flat {
		@include one-line;

		.end {
			font-size: var(--start-size);
			letter-spacing: 0.015em;
		}
	}

	.compact {
		--start-size: 18px;
		--end-size: 12px;
		--elbow-size: 20px;

		.run {
			margin-left: 27px;
		}
	}

	/* the staircase costs too much vertical room on phones — everything runs flat */
	@media (max-width: 639px) {
		.period-stamp {
			@include one-line;
		}

		.compact {
			--start-size: 17px;
		}
	}
</style>
