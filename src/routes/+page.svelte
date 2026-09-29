<script lang="ts">
	import Hero from "$lib/components/hero.svelte";
	import ContactSection from "$lib/components/contact-section.svelte";
	import CurrentExperience from "$lib/components/current-experience.svelte";
	import FormationSection from "$lib/components/formation-section.svelte";
	import HomeNav from "$lib/components/home-nav.svelte";
	import PersonalProjects from "$lib/components/personal-projects.svelte";
	import PreviousExperiences from "$lib/components/previous-experiences.svelte";
	import { compareProjects, occupations, type EnrichedProject } from "$data/experiences";
	import { m } from "$codegen/paraglide/messages.js";
	import { baseLocale, getLocale, locales } from "$codegen/paraglide/runtime.js";
	import { pageUrl, siteUrl } from "$lib/site";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();

	const experiences = occupations.filter((occupation) => occupation.type === "Experience");
	const currentExperience =
		[...experiences].sort((a, b) => b.startYear - a.startYear)[0] ?? occupations[occupations.length - 1];
	const allProjects: EnrichedProject[] = occupations.flatMap((occupation) =>
		occupation.projects.map((project) => ({ ...project, parentOccupation: occupation }))
	);
	const internships = allProjects.filter((project) => project.kind === "internship").sort(compareProjects);
	const education = occupations
		.filter((occupation) =>
			occupation.type === "Formation" && !occupation.projects.some((project) => project.kind === "personal")
		)
		.sort((a, b) => b.startYear - a.startYear);
	const personalProjects = allProjects.filter((project) => project.kind === "personal").sort(compareProjects);

	const ogLocales = { en: "en_US", fr: "fr_FR" } as const;
	const locale = getLocale();
</script>

<svelte:head>
	<title>{m.meta_title()}</title>
	<meta name="description" content={m.meta_description()} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={m.meta_title()} />
	<meta property="og:description" content={m.meta_description()} />
	<meta property="og:locale" content={ogLocales[locale]} />
	{#each locales.filter((other) => other !== locale) as other (other)}
		<meta property="og:locale:alternate" content={ogLocales[other]} />
	{/each}
	<meta name="twitter:card" content="summary_large_image" />
	{#if siteUrl}
		<link rel="canonical" href={pageUrl(locale)} />
		{#each locales as other (other)}
			<link rel="alternate" hreflang={other} href={pageUrl(other)} />
		{/each}
		<link rel="alternate" hreflang="x-default" href={pageUrl(baseLocale)} />
		<meta property="og:url" content={pageUrl(locale)} />
		<meta property="og:image" content={`${siteUrl}/og-${locale}.png`} />
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
	{/if}
</svelte:head>

<HomeNav />

<main class="home-page">
	<Hero experience={currentExperience} />
	<CurrentExperience experience={currentExperience} />
	<PreviousExperiences projects={internships} />
	<FormationSection occupations={education} />
	<PersonalProjects projects={personalProjects} />
	<ContactSection encodedEmail={data.encodedEmail} />
</main>

<style lang="scss">
	.home-page {
		width: 100%;
		min-height: 100vh;
		min-height: 100svh;
		background: var(--page-bg);
	}

	/* the docked bottom nav takes the remaining space, so the content scrolls in here */
	@media (max-width: 639px) {
		.home-page {
			flex: 1 1 auto;
			min-height: 0;
			overflow-y: auto;
			overscroll-behavior: contain;
		}
	}

	:global(#profile),
	:global(#current-experience),
	:global(#previous-experiences),
	:global(#formation),
	:global(#personal-projects),
	:global(#contact) {
		scroll-margin-top: 88px;
	}
</style>
