<script lang="ts">
	import { m } from "$codegen/paraglide/messages.js";
	import { localize, yearAnchor, type Occupation } from "$data/experiences";
	import PeriodStamp from "$lib/components/period-stamp.svelte";
	import SectionMarker from "$lib/components/section-marker.svelte";

	let { occupations }: { occupations: Occupation[] } = $props();

	/* only where the degree name alone undersells it */
	const summaries: Record<string, () => string> = {
		master: m.formation_master_summary,
	};
</script>

<section class="formation" id="formation">
	<div class="section-inner">
		<SectionMarker index="03" />

		<header class="section-header">
			<h2>{m.formation_title()}</h2>
		</header>

		<div class="formation-list">
			{#each occupations as occupation (occupation.id)}
				<article class="formation-item">
					<PeriodStamp
						anchor={yearAnchor(occupation.startYear, occupation.endYear)}
						date={occupation.date}
					/>
					<div class="content">
						<h3>{localize(occupation.title)}</h3>
						<p class="institution">{localize(occupation.institution)} · {occupation.location}</p>
						{#if summaries[occupation.id]}
							<p class="summary">{summaries[occupation.id]()}</p>
						{/if}
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>

<style lang="scss">
	.formation {
		background: var(--section-bg);
		color: white;
		padding: var(--section-space) var(--page-gutter) var(--section-tail);
	}

	.section-inner {
		width: min(var(--page-column), 100%);
		margin: 0 auto;
	}

	.section-header {
		margin-bottom: 40px;

		h2 {
			margin: 0;
			font-size: var(--fs-title);
			font-weight: 700;
			line-height: 1.1;
			letter-spacing: 0;
		}
	}

	.formation-list {
		display: grid;
	}

	.formation-item {
		display: grid;
		grid-template-columns: var(--role-rail) minmax(0, 1fr);
		gap: var(--role-gap);
		position: relative;
		padding: 30px 0;

		/* entries are the top level of content in a flat section, so they take
		   the same band the subsections carry in 01 */
		& + &::before {
			content: "";
			position: absolute;
			inset: 0 0 auto;
			height: var(--rule-band-height);
			background: var(--rule-band);
			mask-image: var(--rule-band-fade);
			pointer-events: none;
		}
	}

	.content {
		display: grid;
		gap: 8px;

		h3 {
			margin: 0;
			font-size: var(--fs-subtitle);
			font-weight: 600;
			line-height: 1.2;
		}
	}

	.institution,
	.summary {
		margin: 0;
	}

	.institution {
		color: rgba(255, 255, 255, 0.5);
		font-size: var(--fs-small);
	}

	.summary {
		color: rgba(255, 255, 255, 0.62);
		font-size: var(--fs-body);
		line-height: 1.6;
	}

	@media (max-width: 799px) {
		.formation-item {
			grid-template-columns: 1fr;
			gap: 12px;
		}
	}

</style>
