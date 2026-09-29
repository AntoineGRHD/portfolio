<script lang="ts">
	/* The one skill chip on the page. Every section that lists technologies uses
	   this, so the teal stays a single decision rather than four copies. */
	let { skills, label }: { skills: string[]; label?: string } = $props();
</script>

{#if skills.length}
	<ul class="skill-tags" aria-label={label}>
		{#each skills as skill (skill)}
			<li>{skill}</li>
		{/each}
	</ul>
{/if}

<style lang="scss">
	.skill-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;

		li {
			padding: 4px 9px;
			border: 1px solid rgba(85, 179, 178, 0.34);
			background: rgba(85, 179, 178, 0.065);
			color: var(--accent-blue-light);
			font-size: var(--fs-caption);
			font-weight: 500;
			line-height: 1.5;
		}
	}
</style>
