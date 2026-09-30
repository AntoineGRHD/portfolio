<script lang="ts">
	let { index }: { index: string } = $props();

	/* Enough marks to overrun the widest container: the run is right-aligned and
	   the overflow is faded out on the left, so no mark is ever cut off. The fade
	   only exists while the run is wider than its box, so this count is tied to
	   the largest --page-column (1320px at 2560px+): at a 4px mark on a 7px gap
	   the run measures 11n + 21, so it has to clear ~1290px. */
	const ticks = Array.from({ length: 128 });
</script>

<div class="section-marker" aria-hidden="true">
	<span class="index">{index}</span>
	<span class="run">
		{#each ticks, tick (tick)}
			<i class="tick"></i>
		{/each}
		<i class="blue"></i>
		<i class="orange"></i>
	</span>
</div>

<style lang="scss">
	.section-marker {
		display: grid;
		grid-template-columns: auto minmax(48px, 1fr);
		align-items: center;
		gap: 12px;
		margin-bottom: 40px;
		font-size: var(--fs-caption);
		font-weight: 800;
		line-height: 1;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.index {
		color: rgba(255, 255, 255, 0.34);
		font-variant-numeric: tabular-nums;
	}

	/* one continuous run of the same mark, ending on the accent pair: the run is
	   packed to the right so the accents always terminate a whole slash */
	.run {
		display: flex;
		justify-content: flex-end;
		gap: 7px;
		overflow: hidden;
		/* the skew throws the top corner ~4.5px past the box; the clip has to
		   sit outside that or it shaves the leading edge off the last slash */
		padding-right: 6px;
		mask-image: linear-gradient(to right, transparent 0, black 72px);

		i {
			display: block;
			flex: 0 0 auto;
			width: 4px;
			height: var(--marker-tick);
			transform: skewX(-28deg);
		}

		/* same 4px box as the accents, so the pitch never changes across the run —
		   only the inked part is thinner */
		.tick {
			background: linear-gradient(to right, #2f2f2f 0 2px, transparent 2px);
		}

		.blue {
			background: var(--accent-blue-light);
		}

		.orange {
			background: var(--accent-orange-light);
		}
	}

	@media (max-width: 639px) {
		.section-marker {
			grid-template-columns: auto minmax(24px, 1fr);
			gap: 9px;
			margin-bottom: 30px;
			letter-spacing: 0.1em;
		}

		.run {
			gap: 6px;
			mask-image: linear-gradient(to right, transparent 0, black 48px);

		}
	}
</style>
