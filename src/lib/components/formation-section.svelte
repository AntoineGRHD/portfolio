<script lang="ts">
	import { m } from "$codegen/paraglide/messages.js";
	import {
		localize,
		sortMissions,
		yearAnchor,
		type Occupation,
	} from "$data/experiences";
	import PeriodStamp from "$lib/components/period-stamp.svelte";
	import ProjectImage from "$lib/components/project-image.svelte";
	import SectionMarker from "$lib/components/section-marker.svelte";
	import SkillTags from "$lib/components/skill-tags.svelte";

	let { occupations }: { occupations: Occupation[] } = $props();

	const summaries: Record<string, () => string> = {
		dut: m.formation_dut_summary,
		licence: m.formation_licence_summary,
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
				{@const universityProjects = occupation.projects.filter((project) => project.kind === "university")}
				<article class="formation-item">
					<PeriodStamp
						anchor={yearAnchor(occupation.startYear, occupation.endYear)}
						date={occupation.date}
					/>
					<div class="content">
						<h3>{localize(occupation.title)}</h3>
						<p class="institution">{localize(occupation.institution)} · {occupation.location}</p>
						<p class="summary">{summaries[occupation.id]?.() ?? localize(sortMissions(occupation.missions ?? [])[0]?.label)}</p>

						{#if universityProjects.length}
							<div class="university-projects">
								{#each universityProjects as project (project.id)}
									<article class="project-item">
										<span class="project-kind">{m.project_kind_university()}</span>
										<h4>{localize(project.name)}</h4>
										<p>{localize(project.description)}</p>
										{#if project.skills?.length || project.image}
											<div class="project-meta">
												{#if project.skills?.length}
													<SkillTags skills={project.skills} label={m.timeline_technologies()} />
												{/if}
												{#if project.image}
													{#if project.skills?.length}
														<span class="meta-divider" aria-hidden="true"></span>
													{/if}
													<ProjectImage
														variant="icon"
														src={project.image}
														alt={localize(project.name)}
														caption={localize(project.name)}
														meta={`${localize(project.date) || project.year} · ${m.project_kind_university()}`}
													/>
												{/if}
											</div>
										{/if}
									</article>
								{/each}
							</div>
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

	/* nested one level under the degree, so these take the lighter rule — the
	   same shape the contributions carry in section 01 */
	.university-projects {
		display: grid;
		gap: 18px;
		margin-top: 18px;
		padding-top: 18px;
		border-top: 1px solid var(--rule-nested);
	}

	/* the same compact register the contributions use, so a project reads the
	   same weight wherever it appears on the page */
	.project-item {
		display: grid;
		justify-items: start;
		gap: 6px;

		& + & {
			padding-top: 18px;
			border-top: 1px solid var(--rule-nested);
		}

		h4 {
			margin: 0;
			font-size: var(--fs-body);
			font-weight: 600;
			line-height: 1.25;
		}

		p {
			margin: 0;
			color: rgba(255, 255, 255, 0.62);
			font-size: var(--fs-small);
			line-height: 1.6;
		}
	}

	/* one row for everything the entry carries: the chips, then the screenshot
	   control after a divider — light blue against light orange */
	.project-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
	}

	.meta-divider {
		width: 1px;
		/* just short of the chips, so it parts them rather than boxing them */
		height: 16px;
		background: var(--rule-item);
	}

	/* every entry in the block is one, but the block sits inside a degree, so the
	   kind has to be said rather than inferred from where it lands */
	.project-kind {
		/* pulls the label onto the name it belongs to, against the item's own gap */
		margin-bottom: -4px;
		color: rgba(255, 255, 255, 0.5);
		font-size: var(--fs-caption);
		font-weight: 600;
		line-height: 1.5;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	@media (max-width: 799px) {
		.formation-item {
			grid-template-columns: 1fr;
			gap: 12px;
		}
	}

</style>
