<script lang="ts">
	import { onMount } from "svelte";
	import Sparkle from "@lucide/svelte/icons/sparkle";
	import { m } from "$codegen/paraglide/messages.js";
	import { compareProjects, localize, type Project } from "$data/experiences";
	import { envSkills } from "$data/env-skills";
	import { mainSkills } from "$data/main-skills";
	import { currentExperience, education, internships, personalProjects } from "$data/sections";
	import { upcomingSkills } from "$data/upcoming-skills";
	import { decodeEmail } from "$lib/email-obfuscation";
	import { siteUrl } from "$lib/site";
	import CvMarker from "./cv-marker.svelte";
	import type { PageProps } from "./$types";

	/* A one-page A4 CV built from the same data as the site. It is not linked or
	   indexed: scripts/build-cv.mjs prints it to PDF in each theme, and the site
	   links to those PDFs. */
	let { data }: PageProps = $props();

	const experience = currentExperience;
	const contributions = [...experience.projects].sort(compareProjects);
	/* the starred work gets its full text, the rest one line each, so the page fits */
	const featured = contributions.filter((project) => project.main);
	const others = contributions.filter((project) => !project.main);
	const website = siteUrl.replace(/^https?:\/\//, "");
	/* the CV lists each contribution as bullets: its points, else its one-line summary */
	const bullets = (project: Project) => project.points ?? [project.short ?? project.description];

	const skillGroups = [
		{ label: () => m.cv_skills_stack(), skills: mainSkills },
		{ label: () => m.cv_skills_env(), skills: envSkills },
		{ label: () => m.cv_skills_next(), skills: upcomingSkills },
	];

	/* The site's backdrop bands, folded into the top-right corner: each band crosses
	   it from the top edge to the right edge, the darkest furthest in, the red at the tip. */
	const bandColors = ["#053b61", "#035c7e", "#55b3b2", "#f8c397", "#ee8c0f", "#b7170f", "#890a13"];
	const bandWidth = 7;
	const bandStep = 9.2;
	const bands = bandColors.map((color, index) => {
		const near = 6 + (bandColors.length - 1 - index) * bandStep;
		const far = near + bandWidth;
		const points = [[100 - far, 0], [100 - near, 0], [100, near], [100, far]];
		return { color, path: `M${points.map(([x, y]) => `${x} ${y}`).join(" L")} Z` };
	});

	let email = $state("");
	let ready = $state(false);

	/* The site draws skill icons as CSS masks, which several PDF viewers render as
	   plain squares. The CV inlines each SVG instead, stripped of its brand colours
	   (Vite inlines small ones with single quotes, hence both quote styles) so it
	   takes the text colour. */
	let icons = $state<Record<string, string>>({});

	function monochrome(svg: string): string {
		return svg
			.replace(/\sfill=(["'])(?!none\1).*?\1/g, "")
			.replace(/<svg\b([^>]*)>/, (_, attributes: string) =>
				`<svg${attributes.replace(/\s(width|height)=(["']).*?\2/g, "")} fill="currentColor" width="100%" height="100%" aria-hidden="true">`
			);
	}

	onMount(async () => {
		email = decodeEmail(data.encodedEmail);
		const entries = await Promise.all(
			skillGroups.flatMap((group) => group.skills).map(async (skill) => {
				const svg = await (await fetch(skill.icon)).text();
				return [skill.name, monochrome(svg)] as const;
			})
		);
		icons = Object.fromEntries(entries);
		await document.fonts.ready;
		// marker runs size themselves from their measured width, one frame after layout
		await new Promise((settled) => requestAnimationFrame(() => requestAnimationFrame(settled)));
		/* the print script waits for this before measuring and printing */
		ready = true;
	});
</script>

<svelte:head>
	<title>{m.cv_title()}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<article class="cv" data-theme="dark" data-ready={ready}>
	<svg class="bands" viewBox="0 0 100 100" aria-hidden="true">
		{#each bands as band (band.color)}
			<path d={band.path} fill={band.color} />
		{/each}
	</svg>

	<header class="header">
		<h1 class="name">Antoine GOURHAND</h1>
		<p class="role">
			<strong>{localize(experience.title)}</strong>
			<span class="at">@</span>
			{localize(experience.institution)}
			<span class="dash">·</span>
			<span class="muted">{experience.location}</span>
		</p>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- the markup comes from our own message files -->
		<p class="tagline">{@html m.hero_tagline()}</p>
	</header>

	<div class="columns">
		<aside class="side">
			<section>
				<CvMarker label={m.cv_contact()} />
				<dl class="contact">
					<dt class="group-label">{m.cv_email()}</dt>
					<dd><a href="mailto:{email}">{email}</a></dd>
					<dt class="group-label">{m.cv_website()}</dt>
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- absolute external URL, not a route -->
					<dd><a href={siteUrl}>{website}</a></dd>
				</dl>
				<p class="muted location">{m.contact_location()}</p>
			</section>

			<section>
				<CvMarker label={m.cv_languages()} />
				<ul class="plain">
					<li>{m.cv_language_french()} <span class="muted">· {m.cv_language_french_level()}</span></li>
					<li>{m.cv_language_english()} <span class="muted">· {m.cv_language_english_level()}</span></li>
				</ul>
			</section>

			<section>
				<CvMarker label={m.cv_skills()} />
				{#each skillGroups as group (group.skills)}
					<p class="group-label">{group.label()}</p>
					<ul class="skills">
						{#each group.skills as skill (skill.name)}
							<li>
								<!-- eslint-disable-next-line svelte/no-at-html-tags -- our own bundled icon files -->
								<span class="icon">{@html icons[skill.name] ?? ""}</span>
								<span>{skill.name}</span>
							</li>
						{/each}
					</ul>
				{/each}
			</section>

			<section>
				<CvMarker label={m.formation_title()} />
				{#each education as degree (degree.id)}
					<div class="entry compact">
						<h3>{localize(degree.title)}</h3>
						<p class="muted">{localize(degree.institution)} · {localize(degree.date)}</p>
					</div>
				{/each}
			</section>

			<section>
				<CvMarker label={m.personal_title()} />
				{#each personalProjects as project (project.id)}
					<div class="entry compact">
						<h3>{localize(project.name)}</h3>
						<p class="muted">{localize(project.date) || project.year}</p>
						<p class="short">{localize(project.short ?? project.description)}</p>
					</div>
				{/each}
			</section>
		</aside>

		<main class="main">
			<section>
				<CvMarker label={m.current_title()} />
				<div class="entry">
					<div class="entry-head">
						<h3>{localize(experience.title)} <span class="at">@</span> {localize(experience.institution)}</h3>
						<span class="date">{localize(experience.date)}</span>
					</div>
					<p class="summary">{m.experience_ubi_summary()}</p>
					{#if experience.milestones?.length}
						<!-- the arrows carry the meaning, so no label: it keeps the run on one line -->
						<p class="progression" aria-label={m.current_progression_label()}>
							{#each experience.milestones as milestone, index (milestone.year)}
								{#if index > 0}<span class="arrow" aria-hidden="true">→</span>{/if}
								<span class:current={index === experience.milestones.length - 1}>
									{localize(milestone.title)} <span class="muted">({localize(milestone.date) || milestone.year})</span>
								</span>
							{/each}
						</p>
					{/if}
				</div>

				<p class="group-label contributions-label">{m.current_projects_title()}</p>
				{#each featured as project (project.id)}
					<div class="contribution">
						<h4>
							{localize(project.name)}
							<Sparkle class="star" size={11} strokeWidth={1.5} absoluteStrokeWidth aria-label={m.contribution_main()} />
						</h4>
						<ul class="points">
							{#each bullets(project) as point, index (index)}
								<li>{localize(point)}</li>
							{/each}
						</ul>
					</div>
				{/each}
				<p class="group-label others-label">{m.cv_other_contributions()}</p>
				{#each others as project (project.id)}
					<div class="contribution minor">
						<h4>{localize(project.name)}</h4>
						<ul class="points">
							{#each bullets(project) as point, index (index)}
								<li>{localize(point)}</li>
							{/each}
						</ul>
					</div>
				{/each}
			</section>

			<section>
				<CvMarker label={m.previous_title()} />
				{#each internships as internship (internship.id)}
					<div class="entry">
						<div class="entry-head">
							<h3>
								{localize(internship.role ?? internship.name)}
								<span class="at">@</span>
								{localize(internship.organization ?? internship.parentOccupation.institution)}
							</h3>
							<span class="date">{localize(internship.date)}</span>
						</div>
						<p class="summary">{localize(internship.description)}</p>
					</div>
				{/each}
			</section>
		</main>
	</div>
</article>

<style lang="scss">
	@page {
		size: A4;
		margin: 0;
	}

	/* dark follows the site; light is the printer-friendly twin, with the teal
	   darkened so it stays readable on white */
	.cv {
		--cv-bg: #050505;
		--cv-text: #f2f2f2;
		--cv-strong: #ffffff;
		--cv-muted: rgba(255, 255, 255, 0.62);
		--cv-rule: rgba(255, 255, 255, 0.14);
		--cv-tick: #3a3a3a;
		/* one blue and one orange per theme, shared by every accent: marker slashes,
		   icons, bullets, star and the current milestone */
		/* the site's softened accent pair (see +layout.svelte), one source for both */
		--cv-accent: var(--accent-blue-light);
		--cv-orange: var(--accent-orange-light);
		--cv-bands-opacity: 0.9;

		/* set by the print script at runtime, so the selector must survive pruning */
		&:global([data-theme="light"]) {
			--cv-bg: #ffffff;
			--cv-text: #2b2b2b;
			--cv-strong: #0a0a0a;
			--cv-muted: #5e5e5e;
			--cv-rule: #dcdcdc;
			--cv-tick: #c4c4c4;
			/* deeper so they hold on white; the orange leans red rather than dark, which
			   keeps it vivid instead of brown */
			--cv-accent: #2f8f8e;
			--cv-orange: #e25a12;
			--cv-bands-opacity: 1;
		}

		position: relative;
		box-sizing: border-box;
		width: 210mm;
		height: 297mm;
		overflow: hidden;
		padding: 13mm 13mm 11mm;
		background: var(--cv-bg);
		color: var(--cv-text);
		font-size: 8.3pt;
		line-height: 1.4;
		print-color-adjust: exact;
		-webkit-print-color-adjust: exact;

		:global(*) {
			box-sizing: border-box;
		}
	}

	h1,
	h3,
	h4,
	p,
	ul {
		margin: 0;
	}

	ul {
		padding: 0;
		list-style: none;
	}

	a {
		color: inherit;
		text-decoration: none;
	}

	.muted {
		color: var(--cv-muted);
	}

	.at,
	.dash {
		color: var(--cv-muted);
		font-weight: 500;
	}

	.bands {
		position: absolute;
		width: 46mm;
		height: 46mm;
		top: 0;
		right: 0;
		opacity: var(--cv-bands-opacity);
	}

	.header {
		position: relative;
		margin-bottom: 5mm;
		/* as wide as the corner bands allow (they start 46 mm from the right edge) */
		max-width: 151mm;
	}

	.name {
		color: var(--cv-strong);
		font-size: 25pt;
		font-weight: 700;
		line-height: 1.05;
	}

	.role {
		margin-top: 2mm;
		font-size: 11.5pt;

		strong {
			color: var(--cv-strong);
			font-weight: 600;
		}
	}

	.tagline {
		margin-top: 2.5mm;
		color: var(--cv-muted);
		font-size: 8.8pt;

		:global(strong) {
			color: var(--cv-strong);
			font-weight: 600;
		}
	}

	.columns {
		display: grid;
		grid-template-columns: 50mm minmax(0, 1fr);
		gap: 8mm;
	}

	.side,
	.main {
		display: grid;
		align-content: start;
		gap: 5.4mm;
	}

	.plain {
		display: grid;
		gap: 0.8mm;
	}

	.contact {
		display: grid;
		margin: 0;

		dd {
			margin: 0.3mm 0 1.6mm;
		}
	}

	.group-label {
		color: var(--cv-muted);
		font-size: 6.8pt;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.skills {
		display: flex;
		flex-wrap: wrap;
		gap: 1.2mm 3mm;
		margin: 1mm 0 2.4mm;

		li {
			display: flex;
			align-items: center;
			gap: 1.1mm;
		}

		.icon {
			display: block;
			flex: 0 0 auto;
			width: 3.2mm;
			height: 3.2mm;
			color: var(--cv-accent);
			/* Poppins sits high in its line box (deep descent), so centring on the line
			   leaves the icon low: lift it onto the letters' optical centre */
			transform: translateY(-0.35mm);

			:global(svg) {
				display: block;
			}
		}
	}

	.entry {
		& + & {
			margin-top: 3mm;
		}

		&.compact + &.compact {
			margin-top: 2.2mm;
		}

		h3 {
			color: var(--cv-strong);
			font-size: 9pt;
			font-weight: 600;
			line-height: 1.3;
		}
	}

	.entry-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 3mm;
	}

	.date {
		flex: 0 0 auto;
		color: var(--cv-muted);
		font-size: 7.6pt;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.summary {
		margin-top: 1mm;
	}

	.progression {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.6mm 1.6mm;
		/* ruled off like the contribution lists below it; the extra half millimetre on
		   top (taken back below) centres the letters, since Poppins sits high in its line */
		margin-top: 2.8mm;
		padding-top: 2.9mm;
		border-top: 1px solid var(--cv-rule);

		.current {
			color: var(--cv-orange);
			font-weight: 600;
		}
	}

	.arrow {
		color: var(--cv-muted);
	}

	.contributions-label {
		margin-top: 2.7mm;
		padding-top: 2.6mm;
		border-top: 1px solid var(--cv-rule);
	}

	.contribution {
		margin-top: 3mm;

		h4 {
			display: flex;
			align-items: center;
			gap: 1.2mm;
			color: var(--cv-strong);
			font-size: 9pt;
			font-weight: 600;
		}

		:global(.star) {
			color: var(--cv-orange);
		}

	}

	/* the same heading-over-rule the selected contributions open with */
	.others-label {
		margin-top: 3mm;
		padding-top: 2.6mm;
		border-top: 1px solid var(--cv-rule);
	}



	/* the other contributions: the same shape as the selected ones, a size down */
	.contribution.minor {
		margin-top: 2mm;
		font-size: 7.9pt;

		h4 {
			font-size: 8.3pt;
		}
	}

	.others-label + .contribution.minor {
		margin-top: 1.6mm;
	}

	/* one idea per line, marked with the site's slash rather than a dot */
	.points {
		display: grid;
		gap: 0.5mm;
		margin-top: 0.9mm;

		li {
			position: relative;
			padding-left: 3.2mm;

			&::before {
				content: "";
				position: absolute;
				left: 0.6mm;
				/* measured against the letters: centred between cap and x-height, since
				   Poppins sits high in its line box */
				top: 0.36em;
				width: 0.35mm;
				height: 0.62em;
				background: var(--cv-accent);
				transform: skewX(-28deg);
			}
		}
	}

	.short {
		margin-top: 0.6mm;
	}



</style>
