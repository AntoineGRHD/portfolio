<script lang="ts">
	import { m } from "$codegen/paraglide/messages.js";
	import { projectAnchor, type EnrichedProject } from "$data/experiences";
	import ContributionItem from "$lib/components/contribution-item.svelte";
	import RoleIdentity from "$lib/components/role-identity.svelte";
	import SectionMarker from "$lib/components/section-marker.svelte";
	import SkillTags from "$lib/components/skill-tags.svelte";

	let { projects }: { projects: EnrichedProject[] } = $props();
</script>

<section class="previous-experiences" id="previous-experiences">
	<div class="section-inner">
		<SectionMarker index="02" />

		<header class="section-header">
			<h2>{m.previous_title()}</h2>
		</header>

		<div class="experience-list">
			{#each projects as project (project.id)}
				<article class="experience-item">
					<RoleIdentity
						anchor={projectAnchor(project)}
						date={project.date}
						role={project.role ?? project.name}
						organization={project.organization ?? project.parentOccupation.institution}
						location={project.location ?? project.parentOccupation.location}
						summary={project.description}
					>
						{#if project.skills?.length}
							<div class="project-stack">
								<SkillTags skills={project.skills} label={m.timeline_technologies()} />
							</div>
						{/if}

						{#if project.contributions?.length}
							{@const contributions = project.contributions}
							<section class="contributions" aria-labelledby="contributions-{project.id}">
								<p class="subsection-title" id="contributions-{project.id}">
									{m.contributions_label()}
								</p>
								<div class="compact-list">
									{#each contributions as contribution (contribution.id)}
										<ContributionItem
											name={contribution.name}
											description={contribution.description}
											skills={contribution.skills}
											compact
										/>
									{/each}
								</div>
							</section>
						{/if}
					</RoleIdentity>
				</article>
			{/each}
		</div>
	</div>
</section>

<style lang="scss">
	.previous-experiences {
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

	.experience-list {
		display: grid;
	}

	.experience-item {
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

	/* the stack sits under the summary that describes the work it was used for */
	.project-stack {
		margin-top: 14px;
	}

	/* the secondary register, same as the run under the current role */
	.contributions {
		margin-top: 22px;
	}

	.subsection-title {
		margin: 0;
		color: rgba(255, 255, 255, 0.76);
		font-size: var(--fs-caption);
		font-weight: 600;
		line-height: 1.6;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.compact-list {
		display: grid;
		gap: 18px;
		margin-top: 16px;
	}

</style>
