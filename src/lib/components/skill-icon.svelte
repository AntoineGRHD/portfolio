<script lang="ts">
	import type { Skill } from "$data/skills";

	/* The SVG is used as a mask over the text colour, so every mark is tinted
	   like the chip around it, whatever colours the source file carries. */
	let { skill, size }: { skill: Skill; size?: number } = $props();
</script>

<span
	class="skill-icon"
	style:--skill-icon-src={`url("${skill.icon}")`}
	style:font-size={size ? `${size}px` : undefined}
	role="img"
	aria-label={skill.name}
></span>

<style lang="scss">
	.skill-icon {
		display: inline-block;
		width: 1em;
		height: 1em;
		background-color: currentColor;
		mask-image: var(--skill-icon-src);
		mask-size: contain;
		mask-repeat: no-repeat;
		mask-position: center;
	}
</style>
