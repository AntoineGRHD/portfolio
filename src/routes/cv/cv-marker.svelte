<script lang="ts">
	/* The site's section marker for the CV: the section name, then a run of slashes
	   ending on the blue and orange accents. It is drawn as vector shapes, since PDF
	   viewers such as pdf.js render CSS gradient patterns as a solid bar, and sized to
	   a whole number of marks so no slash is cut. As on the site, every mark sits in
	   the same box and keeps the same pitch: the accents just fill their box. */
	let { label }: { label: string } = $props();

	// tenths of a millimetre, in the site's proportions (4px box, 2px ink, 11px pitch, 17px tall)
	const height = 28;
	const pitch = 18;
	const box = 6.6;
	const ink = 3.3;
	const lean = height * Math.tan((28 * Math.PI) / 180);
	const fadeLength = 7;

	let runWidth = $state(0);

	const marks = $derived.by(() => {
		const available = (runWidth * 254) / 96;
		const count = Math.floor((available - box - lean) / pitch) + 1;
		if (count < 2) return [];
		return Array.from({ length: count }, (_, index) => {
			const x = index * pitch;
			const accent = index >= count - 2;
			const width = accent ? box : ink;
			return {
				path: `M${x} ${height} L${x + width} ${height} L${x + width + lean} 0 L${x + lean} 0 Z`,
				tone: accent ? (index === count - 2 ? "blue" : "orange") : undefined,
				opacity: accent ? 1 : Math.min(1, (index + 1) / fadeLength),
			};
		});
	});
	const drawingWidth = $derived(marks.length ? (marks.length - 1) * pitch + box + lean : 0);
</script>

<h2 class="marker">
	<span class="label">{label}</span>
	<span class="run" aria-hidden="true" bind:clientWidth={runWidth}>
		{#if marks.length}
			<svg viewBox="0 0 {drawingWidth} {height}" style:width="{drawingWidth / 10}mm">
				{#each marks as mark (mark.path)}
					<path d={mark.path} class={mark.tone} fill-opacity={mark.opacity} />
				{/each}
			</svg>
		{/if}
	</span>
</h2>

<style>
	.marker {
		display: flex;
		align-items: center;
		gap: 2.5mm;
		margin: 0 0 2.6mm;
		color: var(--cv-strong);
		font-size: 7.6pt;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.run {
		display: flex;
		flex: 1 1 0;
		justify-content: flex-end;
		min-width: 0;
		height: 2.8mm;
	}

	svg {
		display: block;
		height: 100%;
		fill: var(--cv-tick);
	}

	/* the theme's accent pair, the same the icons, bullets and star use */
	.blue {
		fill: var(--cv-accent);
	}

	.orange {
		fill: var(--cv-orange);
	}
</style>
