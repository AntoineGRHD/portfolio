import { compareProjects, occupations, type EnrichedProject } from "$data/experiences";

/* What each part of the portfolio shows, chosen once so the home page and the CV
   always present the same content. */

const experiences = occupations.filter((occupation) => occupation.type === "Experience");

export const currentExperience =
	[...experiences].sort((a, b) => b.startYear - a.startYear)[0] ?? occupations[occupations.length - 1];

const allProjects: EnrichedProject[] = occupations.flatMap((occupation) =>
	occupation.projects.map((project) => ({ ...project, parentOccupation: occupation }))
);

export const internships = allProjects.filter((project) => project.kind === "internship").sort(compareProjects);

export const education = occupations
	.filter((occupation) =>
		occupation.type === "Formation" && !occupation.projects.some((project) => project.kind === "personal")
	)
	.sort((a, b) => b.startYear - a.startYear);

export const personalProjects = allProjects.filter((project) => project.kind === "personal").sort(compareProjects);
