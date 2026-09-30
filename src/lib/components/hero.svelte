<script lang="ts">
	import { m } from "$codegen/paraglide/messages.js";
	import { localize, type Occupation } from "$data/experiences";
	import { mainSkills } from "$data/main-skills";
	import { upcomingSkills } from "$data/upcoming-skills";
	import { envSkills } from "$data/env-skills";
	import SkillIcon from "$lib/components/skill-icon.svelte";
	import HeroBackdrop from "$lib/components/hero-backdrop.svelte";
	import ParaglideSwitch from "$lib/components/paraglide-switch.svelte";

	let { experience }: { experience: Occupation } = $props();
</script>

<section class="hero" id="profile">
	<div class="hero-background" aria-hidden="true">
		<HeroBackdrop />
	</div>

	<!-- mobile only: the top bar is hidden there, and this copy scrolls away with the page -->
	<div class="hero-locale">
		<ParaglideSwitch />
	</div>

	<div class="hero-content">
		<h1 class="name">Antoine GOURHAND</h1>

		<div class="role-row">
			<span class="position">
				<span class="role">{localize(experience.title)}</span>
				<span class="employer">
					<span class="separator">@</span>
					<span class="company">{localize(experience.institution)}</span>
				</span>
			</span>
			<span class="place">
				<span class="separator">·</span>
				<span class="location">{experience.location}</span>
			</span>
		</div>

		<div class="tagline">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- the markup comes from our own message files -->
			<p>{@html m.hero_tagline()}</p>
		</div>

		<div class="skills-section">
			<div class="skills-group">
				<span class="skills-label">Stack</span>
				<div class="skills-strip">
					{#each mainSkills as skill (skill.name)}
						<div class="skill-chip" title={skill.name}>
							<SkillIcon {skill} />
							<span class="skill-name">{skill.name}</span>
						</div>
					{/each}
				</div>
			</div>
			<div class="skills-group">
				<span class="skills-label">Env</span>
				<div class="skills-strip">
					{#each envSkills as skill (skill.name)}
						<div class="skill-chip" title={skill.name}>
							<SkillIcon {skill} />
							<span class="skill-name">{skill.name}</span>
						</div>
					{/each}
				</div>
			</div>
			<div class="skills-group">
				<span class="skills-label">Next</span>
				<div class="skills-strip">
					{#each upcomingSkills as skill (skill.name)}
						<div class="skill-chip upcoming" title={skill.name}>
							<SkillIcon {skill} />
							<span class="skill-name">{skill.name}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>

<style lang="scss">
	.hero {
		min-height: 100vh;
		min-height: 100svh;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 118px var(--page-gutter) 84px;
		position: relative;
		box-sizing: border-box;
		overflow: hidden;
		background: var(--page-bg);
	}

	.hero-background {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
	}

	.hero-locale {
		display: none;
	}

	.hero-content {
		position: relative;
		z-index: 1;
		/* same rail as .section-inner in the sections below, so the copy shares their left edge */
		width: min(var(--page-column), 100%);
		margin: 0 auto;
		box-sizing: border-box;
		text-align: left;
	}

	.name {
		font-family: 'Poppins', sans-serif;
		font-size: var(--fs-display);
		line-height: 1.08;
		color: white;
		margin: 0;
		letter-spacing: 0;
		font-weight: 700;
	}

	.role-row {
		display: flex;
		align-items: baseline;
		justify-content: flex-start;
		gap: 10px;
		margin-top: 16px;
		font-size: var(--fs-subtitle);
		line-height: 1.45;
		color: rgba(255, 255, 255, 0.7);
		flex-wrap: wrap;
	}

	.position,
	.place,
	.employer {
		display: inline-flex;
		align-items: baseline;
		gap: 10px;
		white-space: nowrap;
	}

	.role {
		color: white;
		font-weight: 600;
	}

	.separator {
		color: rgba(255, 255, 255, 0.3);
	}

	.tagline {
		margin: 28px 0 0;
		max-width: 760px;

		p {
			color: rgba(255, 255, 255, 0.65);
			font-size: var(--fs-heading);
			line-height: 1.6;
			margin: 0;

			:global(strong) {
				color: white;
			}
		}
	}

	.skills-section {
		margin-top: 38px;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 13px;
	}

	.skills-group {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 16px;
	}

	.skills-label {
		font-size: var(--fs-caption);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0;
		color: rgba(255, 255, 255, 0.5);
		min-width: 48px;
	}

	.skills-strip {
		display: flex;
		justify-content: flex-start;
		gap: 8px;
		flex-wrap: wrap;
	}

	.skill-chip {
		display: flex;
		align-items: center;
		gap: 6px;
		min-height: 38px;
		padding: 6px 12px;
		box-sizing: border-box;
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: rgba(255, 255, 255, 0.8);
		font-size: var(--fs-small);
		transition: all 0.2s ease;

		:global(.skill-icon) {
			font-size: 26px;
		}

		.skill-name {
			font-size: var(--fs-small);
			line-height: 1;
		}

		&:hover {
			border-color: white;
			color: white;
			background: rgba(255, 255, 255, 0.08);
		}

		&.upcoming {
			border-style: dashed;
			opacity: 0.6;

			&:hover {
				opacity: 1;
			}
		}
	}

	/* the fold is hand-tuned across the breakpoints below, so the large steps
	   only lift the ceiling on the type rather than recomposing it */
	@media (min-width: 1920px) {
		.hero {
			padding: 132px var(--page-gutter) 96px;
		}
	}

	@media (min-width: 2560px) {
		.hero {
			padding: 148px var(--page-gutter) 108px;
		}
	}

	@media (max-width: 1199px) {
		.hero {
			padding: 108px var(--page-gutter) 74px;
		}

	}

	@media (max-width: 899px) {
		.hero {
			padding: 96px var(--page-gutter) 58px;
		}


		.role-row {
			gap: 7px 10px;
			font-size: var(--fs-heading);
		}

		.tagline {
			margin-top: 22px;
		}

		.tagline p {
			font-size: var(--fs-body);
		}

		.skills-group {
			flex-direction: column;
			align-items: flex-start;
			gap: 8px;
		}

		.skills-section {
			gap: 14px;
		}
	}

	/* horizontal padding tracks the sections below so the rails stay aligned */
	@media (max-width: 799px) {
		.hero {
			padding-inline: 32px;
		}
	}

	@media (max-width: 639px) {
		/* where the fixed top bar used to hold it */
		.hero-locale {
			display: block;
			position: absolute;
			top: 10px;
			right: 10px;
			z-index: 2;
		}

		.hero {
			/* fills the scroll container, which is now shorter than the viewport */
			min-height: 100%;
			align-items: stretch;
			padding: 104px var(--page-gutter) 56px;

			&::before {
				content: "";
				position: absolute;
				inset: 0;
				background:
					linear-gradient(180deg, rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.04) 42%, rgba(0, 0, 0, 0.28)),
					linear-gradient(90deg, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.28) 62%, rgba(0, 0, 0, 0));
				pointer-events: none;
			}
		}

		.name {
			max-width: 9ch;
			line-height: 1;
		}

		.role-row {
			margin-top: 18px;
			gap: 0 9px;
			font-size: var(--fs-subtitle);
			font-weight: 600;
			line-height: 1.3;
			color: white;
		}

		.position,
		.place {
			white-space: normal;
		}

		.position {
			display: flex;
			flex-wrap: wrap;
			gap: 0 9px;
		}

		.employer {
			gap: 9px;
		}

		.separator {
			font-weight: 500;
		}

		.place {
			flex-basis: 100%;

			.separator {
				display: none;
			}
		}

		.location {
			color: rgba(255, 255, 255, 0.48);
			font-size: 0.85em;
			font-weight: 500;
		}

		.tagline {
			max-width: 34rem;
			margin: 26px 0 0;
		}

		.tagline p {
			font-size: var(--fs-body);
			line-height: 1.55;
		}

		.skills-section {
			align-items: stretch;
			margin-top: 34px;
			gap: 12px;
		}

		.skills-group {
			display: grid;
			grid-template-columns: 48px minmax(0, 1fr);
			align-items: center;
			justify-content: stretch;
			gap: 10px;
		}

		.skills-label {
			font-size: var(--fs-caption);
			min-width: 0;
			text-align: left;
		}

		.skills-strip {
			gap: 7px;
		}

		.skill-chip {
			min-height: 34px;
			padding: 5px 9px;

			:global(.skill-icon) {
				font-size: 22px;
			}

			.skill-name {
				display: none;
			}
		}
	}

	@media (max-width: 380px), (max-height: 760px) and (max-width: 639px) {
		.hero {
			padding: 92px var(--page-gutter) 48px;
		}

		.name {
			font-size: var(--fs-title);
		}

		.tagline {
			margin-top: 18px;
		}

		.tagline p {
			font-size: var(--fs-small);
		}

		.skills-section {
			margin-top: 20px;
		}
	}
</style>
