<script lang="ts">
	import { m } from "$codegen/paraglide/messages.js";
	import { localize, projectAnchor, type EnrichedProject } from "$data/experiences";
	import PeriodStamp from "$lib/components/period-stamp.svelte";
	import ProjectImage from "$lib/components/project-image.svelte";
	import SectionMarker from "$lib/components/section-marker.svelte";
	import SkillTags from "$lib/components/skill-tags.svelte";

	let { projects }: { projects: EnrichedProject[] } = $props();

	const summaries: Record<string, () => string> = {
		zboard: m.personal_zboard_summary,
	};
</script>

<section class="personal-projects" id="personal-projects">
	<div class="section-inner">
		<SectionMarker index="04" />

		<header class="section-header">
			<h2>{m.personal_title()}</h2>
		</header>

		<div class="project-list">
			{#each projects as project (project.id)}
				<article class="project-item">
					<PeriodStamp anchor={projectAnchor(project)} date={project.date} />
					<div class="content">
						<h3>{localize(project.name)}</h3>
						<p class="summary">{summaries[project.id]?.() ?? localize(project.description)}</p>

						{#if project.image}
							<ProjectImage
								src={project.image}
								alt={localize(project.name)}
								caption={localize(project.name)}
								meta={`${localize(project.date) || project.year} · ${m.project_kind_personal()}`}
							/>
						{/if}
						{#if project.skills?.length}
							<SkillTags skills={project.skills} label={m.timeline_technologies()} />
						{/if}
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>

<style lang="scss">
	.personal-projects {
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

	.project-list {
		display: grid;
	}

	.project-item {
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

	.summary {
		margin: 0;
		color: rgba(255, 255, 255, 0.62);
		font-size: var(--fs-body);
		line-height: 1.6;
	}

	@media (max-width: 799px) {
		.project-item {
			grid-template-columns: 1fr;
			gap: 12px;
		}
	}

</style>
