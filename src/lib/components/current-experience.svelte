<script lang="ts">
	import { m } from "$codegen/paraglide/messages.js";
	import { compareProjects, localize, yearAnchor, type Occupation } from "$data/experiences";
	import ContributionItem from "$lib/components/contribution-item.svelte";
	import RoleIdentity from "$lib/components/role-identity.svelte";
	import SectionMarker from "$lib/components/section-marker.svelte";

	let { experience }: { experience: Occupation } = $props();
	/* One run, in the order the role authored — `main` only lights the star. */
	const contributions = $derived([...experience.projects].sort(compareProjects));
</script>

<section class="current-experience" id="current-experience">
	<div class="section-inner">
		<SectionMarker index="01" />

		<header class="section-header">
			<h2>{m.current_title()}</h2>
		</header>

		<div class="role-block">
			<RoleIdentity
				anchor={yearAnchor(experience.startYear, experience.endYear)}
				date={experience.date}
				role={experience.title}
				organization={experience.institution}
				location={experience.location}
				summary={m.experience_ubi_summary()}
				prominent
			/>

			<div class="continuation">
				{#if experience.milestones?.length}
					{@const milestones = experience.milestones}
					<section class="progression" aria-labelledby="progression-title">
						<h3 class="subsection-title" id="progression-title">{m.current_progression_label()}</h3>
						<ol class="track">
							{#each milestones as milestone (milestone.year)}
								<li class="step" class:current={milestone === milestones[milestones.length - 1]}>
									<span class="step-date">{localize(milestone.date) || milestone.year}</span>
									<span class="node" aria-hidden="true"></span>
									<strong class="step-title">{localize(milestone.title)}</strong>
								</li>
							{/each}
						</ol>
					</section>
				{/if}

				<section class="projects-detail" aria-labelledby="contributions-title">
					<h3 class="subsection-title" id="contributions-title">{m.current_projects_title()}</h3>
					<div class="contributions">
						<div class="compact-list">
							{#each contributions as project (project.id)}
								<ContributionItem
									name={project.name}
									description={project.description}
									skills={project.skills}
									main={project.main}
									compact
								/>
							{/each}
						</div>
					</div>
				</section>
			</div>
		</div>
	</div>
</section>


<style lang="scss">
	.current-experience {
		position: relative;
		background: var(--section-bg);
		color: white;
		padding: var(--section-space) var(--page-gutter) var(--section-tail);
	}

	.section-inner {
		width: min(var(--page-column), 100%);
		margin: 0 auto;
	}

	.section-header {
		max-width: 800px;
		margin-bottom: 40px;

		h2 {
			margin: 0;
			font-size: var(--fs-title);
			font-weight: 700;
			line-height: 1.1;
			letter-spacing: 0;
		}
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

	.progression,
	.projects-detail {
		position: relative;
		display: grid;
		grid-template-columns: var(--role-date-width) minmax(0, 1fr);
		gap: var(--role-column-gap);
		padding-top: 34px;

		/* Slanted ink marks form a false border, echoing the section markers a
		   level up — lighter and shorter, so the ladder reads downward. */
		&::before {
			content: "";
			position: absolute;
			inset: 0 0 auto;
			height: var(--rule-band-height);
			background: var(--rule-band);
			mask-image: var(--rule-band-fade);
			pointer-events: none;
		}
	}

	.projects-detail {
		margin-top: 32px;
	}

	/* a run of nodes on a single rule: date above, title below, current step lit */
	.track {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(0, 1fr);
		grid-template-rows: auto auto auto;
		row-gap: 12px;
		column-gap: 20px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.step {
		display: grid;
		grid-row: span 3;
		grid-template-rows: subgrid;
		align-content: start;
	}

	/* same caption voice as the period stamp, so the block reads as one system */
	.step-date {
		color: rgba(255, 255, 255, 0.55);
		font-size: var(--fs-caption);
		font-weight: 600;
		line-height: 1.3;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-variant-numeric: tabular-nums;
	}

	.node {
		position: relative;
		display: flex;
		align-items: center;
		height: 11px;

		/* each node carries its own segment of the rule, so the track stays continuous */
		&::before {
			content: "";
			position: absolute;
			/* Two CSS pixels keep the rule visible when browser zoom maps the
			   layout onto fractional device pixels. */
			top: calc(50% - 1px);
			left: 0;
			/* spans the column gap too, reaching the next node */
			right: -20px;
			height: 2px;
			background: rgba(255, 255, 255, 0.2);
		}

		&::after {
			content: "";
			position: relative;
			width: 9px;
			height: 9px;
			border: 1px solid rgba(255, 255, 255, 0.45);
			transform: rotate(45deg);
			background: var(--section-bg);
		}
	}

	/* the run does not stop dead at the last mark — the role is still running, so
	   the rule carries on past it and dies out */
	.step:last-child .node::before {
		/* no next node to reach, so it ends at the track rather than the gap */
		right: 0;
		background: linear-gradient(to right, rgba(255, 255, 255, 0.2), transparent);
	}

	.step-title {
		color: rgba(255, 255, 255, 0.62);
		font-size: var(--fs-body);
		font-weight: 600;
		line-height: 1.3;
	}

	.step.current {
		.node::after {
			border-color: var(--accent-orange-light);
			background: var(--accent-orange-light);
		}

		.step-title {
			color: var(--accent-orange-light);
		}
	}

	.role-block {
		--role-date-width: var(--role-rail);
		--role-column-gap: var(--role-gap);
	}

	.continuation {
		margin-top: 36px;
	}

	.contributions {
		min-width: 0;
	}

	.compact-list {
		display: grid;
		gap: 18px;
	}

	@media (max-width: 799px) {
		.progression,
		.projects-detail {
			grid-template-columns: 1fr;
			gap: 24px;
		}

	}

	@media (max-width: 639px) {
		/* no room for a horizontal run — the track stacks and the rule turns vertical */
		.track {
			grid-auto-flow: row;
			grid-template-rows: none;
			row-gap: 14px;
		}

		.step {
			position: relative;
			grid-row: auto;
			grid-template-rows: none;
			gap: 2px;
			padding-left: 22px;
		}

		.node {
			position: absolute;
			top: 4px;
			left: 2px;
			bottom: -18px;
			height: auto;
			align-items: flex-start;

			&::before {
				top: 10px;
				bottom: 0;
				left: 4px;
				right: auto;
				width: 2px;
				height: auto;
				background: repeating-linear-gradient(
					to bottom,
					rgba(255, 255, 255, 0.3) 0 3px,
					transparent 3px 7px
				);
			}
		}

		/* stacked, so the trail runs downward instead */
		.step:last-child .node::before {
			right: auto;
			/* Paint the fade rather than masking a narrow strip: masks can lose
			   the trail when browser zoom places it between device pixels. */
			background:
				linear-gradient(to bottom, transparent, var(--section-bg)),
				repeating-linear-gradient(
					to bottom,
					rgba(255, 255, 255, 0.3) 0 3px,
					transparent 3px 7px
				);
		}

		.section-header {
			margin-bottom: 32px;
		}
	}
</style>
