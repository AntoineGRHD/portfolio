<script lang="ts">
	import type { Snippet } from "svelte";
	import { localize, type LocalizedText } from "$data/experiences";
	import PeriodStamp from "$lib/components/period-stamp.svelte";

	/* One presentation for every held role — current or past: the period stamp in
	   the left column, then "role @ organization — location" above a short summary.
	   `prominent` only scales it up for the current role. */
	let {
		anchor,
		date,
		role,
		organization,
		location,
		summary,
		prominent = false,
		children,
	}: {
		anchor: string;
		date?: LocalizedText;
		role: LocalizedText;
		organization?: LocalizedText;
		location?: string;
		summary?: LocalizedText;
		prominent?: boolean;
		children?: Snippet;
	} = $props();

	const organizationText = $derived(localize(organization));
	const summaryText = $derived(localize(summary));
</script>

<div class="role-identity" class:prominent>
	<div class="date-slot">
		<PeriodStamp {anchor} {date} />
	</div>
	<div class="content">
		<h3 class="headline">
			<span class="position">
				<span class="role">{localize(role)}</span>
				{#if organizationText}
					<span class="employer">
						<span class="at" aria-hidden="true">@</span>
						<span class="organization">{organizationText}</span>
					</span>
				{/if}
			</span>
			{#if location}
				<span class="place">
					<span class="separator" aria-hidden="true">—</span>
					<span class="location">{location}</span>
				</span>
			{/if}
		</h3>
		{#if summaryText}
			<p class="summary">{summaryText}</p>
		{/if}
		{@render children?.()}
	</div>
</div>

<style lang="scss">
	.role-identity {
		display: grid;
		grid-template-columns: var(--role-date-width, var(--role-rail)) minmax(0, 1fr);
		gap: var(--role-column-gap, var(--role-gap));
		align-items: start;
	}

	.content {
		display: grid;
		gap: 8px;
		align-content: start;
	}

	/* Keep the role and company together where space allows, with the location
	   moving as a unit when the headline needs another line. */
	.headline {
		--headline-gap: 9px;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0 var(--headline-gap);
		margin: 0;
		font-size: var(--fs-subtitle);
		font-weight: 600;
		line-height: 1.3;
	}

	.position,
	.place,
	.employer {
		display: inline-flex;
		align-items: baseline;
		gap: 0 var(--headline-gap);
		white-space: nowrap;
	}

	.at,
	.separator {
		color: rgba(255, 255, 255, 0.3);
		font-weight: 500;
	}

	.location {
		color: rgba(255, 255, 255, 0.48);
		font-size: 0.85em;
		font-weight: 500;
	}

	.summary {
		margin: 0;
		color: rgba(255, 255, 255, 0.62);
		font-size: var(--fs-body);
		line-height: 1.6;
	}

	.prominent {
		.headline {
			--headline-gap: 12px;
			/* the role sits at the period stamp's scale, so the columns start level */
			font-size: var(--fs-lead);
			line-height: 1.15;
			letter-spacing: -0.01em;
		}

		.summary {
			margin-top: 2px;
			font-size: var(--fs-body);
		}
	}

	@media (max-width: 799px) {
		.role-identity {
			grid-template-columns: 1fr;
			gap: 12px;
		}
	}

	@media (max-width: 639px) {
		.prominent .headline {
			--headline-gap: 9px;
			font-size: var(--fs-subtitle);
			line-height: 1.3;
			letter-spacing: 0;
		}

		.position {
			flex-wrap: wrap;
			white-space: normal;
		}

		.place {
			flex-basis: 100%;
			white-space: normal;
		}

		.separator {
			display: none;
		}
	}
</style>
