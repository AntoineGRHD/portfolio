<script lang="ts">
	import Sparkle from "@lucide/svelte/icons/sparkle";
	import { m } from "$codegen/paraglide/messages.js";
	import { localize, type LocalizedText } from "$data/experiences";
	import SkillTags from "$lib/components/skill-tags.svelte";

	/* One piece of work inside a role: what it was, what it did, what it used.
	   `compact` is the secondary register — same shape, stepped down a size and
	   tightened, for runs that are scanned rather than read through. */
	let { name, description, skills, compact = false, main = false }: {
		name: LocalizedText;
		description?: LocalizedText;
		skills?: string[];
		compact?: boolean;
		/** Marks the ones worth reading first, since the run is otherwise flat. */
		main?: boolean;
	} = $props();
</script>

<article class="contribution" class:compact>
	<h4>
		{localize(name)}
		{#if main}
			<Sparkle class="sparkle" size={14} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" />
			<span class="sr-only">{m.contribution_main()}</span>
		{/if}
	</h4>
	{#if description}
		<p>{localize(description)}</p>
	{/if}
	{#if skills?.length}
		<SkillTags {skills} label={m.timeline_technologies()} />
	{/if}
</article>

<style lang="scss">
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	.contribution {
		display: grid;
		gap: 10px;
		align-items: start;
		padding: 0 0 26px;
		/* nested inside a subsection, so a step lighter than a peer item */
		border-bottom: 1px solid var(--rule-nested);

		h4 {
			display: flex;
			align-items: center;
			gap: 8px;
			margin: 0;
			font-size: var(--fs-heading);
			font-weight: 600;
			line-height: 1.2;
		}

		/* light orange against the light blue chips below, and small enough to
		   register only once you are already reading the title */
		:global(.sparkle) {
			flex: 0 0 auto;
			color: var(--accent-orange-light);
		}

		p {
			margin: 0;
			color: rgba(255, 255, 255, 0.62);
			font-size: var(--fs-body);
			line-height: 1.6;
		}
	}

	.contribution.compact {
		gap: 6px;
		padding: 0 0 14px;

		h4 {
			font-size: var(--fs-body);
		}

		p {
			font-size: var(--fs-small);
		}
	}
</style>
