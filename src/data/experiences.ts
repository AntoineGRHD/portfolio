import { getLocale } from "$codegen/paraglide/runtime.js";

export type ProjectKind = "university" | "internship" | "personal" | "professional";
export type LocalizedText = string | { en: string; fr: string };

export type Project = {
	id: string;
	name: LocalizedText;
	kind: ProjectKind;
	description: LocalizedText;
	/** Position held, when the project stands on its own as a role (internships). */
	role?: LocalizedText;
	/** Host organization, when it differs from the parent occupation's institution. */
	organization?: LocalizedText;
	/** Where the work took place, when it differs from the parent occupation's location. */
	location?: string;
	date?: LocalizedText;
	skills?: string[];
	image?: string;
	year: number;
	/** Set when the project spans several years, so the date stamp can show a range. */
	endYear?: number | "present";
	sortOrder?: number;
	/** Authored display position, ascending. Overrides the default newest-first run. */
	order?: number;
	/** Marks the work worth reading first within a role. */
	main?: boolean;
};

export type Milestone = {
	title: LocalizedText;
	year: number;
	date?: LocalizedText;
};

export type Occupation = {
	id: string;
	title: LocalizedText;
	institution: LocalizedText;
	location: string;
	type: "Formation" | "Experience";
	startYear: number;
	endYear: number | "present";
	date?: LocalizedText;
	milestones?: Milestone[];
	projects: Project[];
};

export type EnrichedProject = Project & { parentOccupation: Occupation };

export function localize(value: LocalizedText | undefined): string {
	if (!value) {
		return "";
	}

	if (typeof value === "string") {
		return value;
	}

	const locale = getLocale() as keyof typeof value;
	return value[locale] ?? value.en ?? value.fr;
}

/**
 * An authored `order` wins and runs ascending, so a role can lead with its
 * headline work. Anything without one falls in behind it, newest first.
 */
export function compareProjects(a: Project, b: Project): number {
	if (a.order !== undefined || b.order !== undefined) {
		if (a.order === undefined) return 1;
		if (b.order === undefined) return -1;
		return a.order - b.order;
	}

	return (b.sortOrder ?? b.year) - (a.sortOrder ?? a.year);
}

/**
 * Splits an authored period ("Sep. 2014 – Jun. 2016") into its two endpoints so the
 * date stamp can offset them. Single dates ("Spring 2016") come back without an end.
 */
export function splitPeriod(text: string): { start: string; end?: string } {
	const [start, end] = text.split(/\s+[–—-]\s+/, 2);
	return { start: start ?? "", end: end || undefined };
}

/**
 * Compact year anchor shown as the headline of a date stamp: "2020", "2014–16", "2021 -".
 * `endYear: "present"` marks work still ongoing.
 * The precise months stay in `date`, rendered underneath as the caption.
 */
export function yearAnchor(startYear: number, endYear?: number | "present"): string {
	if (endYear === "present") {
		return `${startYear} -`;
	}

	if (endYear === undefined || endYear === startYear) {
		return String(startYear);
	}

	const sameCentury = Math.floor(startYear / 100) === Math.floor(endYear / 100);
	return sameCentury ? `${startYear}–${String(endYear).slice(-2)}` : `${startYear}–${endYear}`;
}

export function projectAnchor(project: Project): string {
	return yearAnchor(project.year, project.endYear);
}

export const occupations: Occupation[] = [
	{
		id: "dut",
		title: {
			fr: "DUT Informatique",
			en: "Technical University Diploma in Computer Science",
		},
		institution: {
			fr: "Université de Bretagne Sud",
			en: "University of Southern Brittany",
		},
		location: "Vannes, France",
		type: "Formation",
		startYear: 2014,
		endYear: 2016,
		date: {
			fr: "Sept. 2014 – Juin 2016",
			en: "Sep. 2014 – Jun. 2016",
		},
		projects: [
		],
	},
	{
		id: "licence",
		title: {
			fr: "Licence Informatique",
			en: "Bachelor's Degree in Computer Science",
		},
		institution: {
			fr: "Université de Bretagne Sud",
			en: "University of Southern Brittany",
		},
		location: "Vannes, France",
		type: "Formation",
		startYear: 2016,
		endYear: 2017,
		date: {
			fr: "Sept. 2016 – Juin 2017",
			en: "Sep. 2016 – Jun. 2017",
		},
		projects: [
			{
				id: "irisa-gee",
				name: "Google Earth Engine",
				kind: "internship",
				role: {
					fr: "Stage en développement logiciel",
					en: "Software Development Internship",
				},
				organization: "IRISA",
				location: "Vannes, France",
				description: {
					fr: "Évaluation de Google Earth Engine face aux outils de l'équipe de recherche, en réimplémentant leurs traitements et en comparant leurs performances.",
					en: "Evaluated Google Earth Engine against the research team's existing tools by reimplementing their processing tasks and benchmarking them.",
				},
				skills: ["JavaScript", "Python"],
				year: 2016,
				sortOrder: 2016.6,
				date: {
					fr: "Avr. 2016 – Juin 2016",
					en: "Apr. 2016 – Jun. 2016",
				},
			},
		],
	},
	{
		id: "master",
		title: {
			fr: "Master Informatique",
			en: "Master's Degree in Computer Science",
		},
		institution: {
			fr: "Université de Bretagne Sud",
			en: "University of Southern Brittany",
		},
		location: "Vannes, France",
		type: "Formation",
		startYear: 2017,
		endYear: 2019,
		date: {
			fr: "Sept. 2017 – Juin 2019",
			en: "Sep. 2017 – Jun. 2019",
		},
		projects: [
			{
				id: "seed",
				name: {
					fr: "Application Web",
					en: "Web Application",
				},
				kind: "internship",
				role: {
					fr: "Stage en développement fullstack",
					en: "Fullstack Development Internship",
				},
				organization: "See-D",
				location: "Vannes, France",
				description: {
					fr: "Développement d'une application web permettant à une équipe de statisticiens de consulter et modifier la description de ses jeux de données, avec des formulaires générés à partir de leurs champs.",
					en: "Built a web application for a statistics team to browse and edit the descriptions of its datasets, with forms generated from their field definitions.",
				},
				skills: ["Jade", "Node.js", "MongoDB", "Docker"],
				year: 2019,
				sortOrder: 2019.6,
				date: {
					fr: "Janv. 2019 – Juin 2019",
					en: "Jan. 2019 – Jun. 2019",
				},
			},
		],
	},
	{
		id: "autodidacte",
		title: {
			fr: "Formation autodidacte",
			en: "Self-directed training",
		},
		institution: "-",
		location: "Vannes, France",
		type: "Formation",
		startYear: 2019,
		endYear: 2021,
		date: "2019 – 2021",
		projects: [
			{
				id: "zboard",
				name: "Zboard",
				kind: "personal",
				description: {
					fr: "Développement d'un tableau de bord partagé pour suivre les streamers participant à un événement caritatif et afficher leur statut en temps réel. Réalisé avec React et Node.js.",
					en: "Built a shared dashboard for following streamers participating in a charity event, showing their status in real time. Developed with React and Node.js.",
				},
				skills: ["React", "CSS", "Node.js"],
				image: "/images/projects/zboard/zboard_main.webp",
				year: 2020,
				sortOrder: 2020,
				date: "Oct. 2020",
			},
		],
	},
	{
		id: "ubi",
		title: "Tech Lead",
		institution: "UBI Solutions",
		location: "Bordeaux, France",
		type: "Experience",
		startYear: 2021,
		endYear: "present",
		date: {
			fr: "Nov. 2021 – Présent",
			en: "Nov. 2021 – Present",
		},
		milestones: [
			{ title: "Junior Developer", year: 2021, date: "Nov. 2021" },
			{ title: "Developer", year: 2023, date: "Jan. 2023" },
			{ title: "Tech Lead", year: 2024, date: "Oct. 2024" },
		],
		projects: [
			{
				id: "client-projects",
				name: {
					fr: "Projets clients",
					en: "Client projects",
				},
				kind: "professional",
				description: {
					fr: "En parallèle de la plateforme principale, développement d'applications dédiées pour des clients des secteurs de la santé et de la logistique. Travail en direct avec eux pour clarifier leurs besoins et leurs règles métier, valider les évolutions nécessaires et assurer la compatibilité avec leurs systèmes existants.",
					en: "Alongside the main platform, developed separate applications for clients in healthcare and logistics. Worked directly with them to clarify their needs and business rules, agree on the required changes, and ensure compatibility with their existing business systems.",
				},
				skills: ["Java", "Angular"],
				year: 2021,
				endYear: "present",
				order: 3,
				main: true,
			},
			{
				id: "technical-leadership",
				name: {
					fr: "Leadership technique",
					en: "Technical leadership",
				},
				kind: "professional",
				description: {
					fr: "Animation des discussions d'architecture avec l'équipe, en adaptant les propositions aux retours des développeurs et en décidant d'avancer malgré les désaccords ou d'abandonner une approche. Aide aux développeurs pour déboguer des problèmes complexes et raisonner sur leurs choix de conception.",
					en: "Led architecture discussions with the team, adapting proposals to developers' concerns and deciding when to proceed despite disagreement or drop an approach. Helped teammates debug difficult issues and reason through design choices.",
				},
				year: 2024,
				endYear: "present",
				sortOrder: 2024.8,
				order: 4,
				date: {
					fr: "Oct. 2024 – Présent",
					en: "Oct. 2024 – Present",
				},
			},
			{
				id: "ai-workflow",
				name: {
					fr: "Workflow IA",
					en: "AI workflow",
				},
				kind: "professional",
				description: {
					fr: "Évaluation des agents de codage et définition des pratiques de l'équipe pour leur utilisation en développement : quelles tâches déléguer, à quelles données les agents peuvent accéder et comment relire le code généré.",
					en: "Evaluated coding agents and established team guidelines for their use in development: which tasks to delegate, what data agents can access, and how generated code should be reviewed.",
				},
				skills: ["Claude Code", "Codex", "Java", "Angular"],
				year: 2025,
				endYear: "present",
				sortOrder: 2025.6,
				order: 8,
				date: {
					fr: "Mi-2025 – Présent",
					en: "Mid-2025 – Present",
				},
			},
			{
				id: "iot",
				name: {
					fr: "Intégration d'équipements",
					en: "Device integration",
				},
				kind: "professional",
				description: {
					fr: "Développement de modules Java et Spring Boot pour intégrer des équipements aux formats de messages variés et aux protocoles inégalement standardisés. Gestion des données entrantes, des commandes sortantes et des mises à jour de firmware à distance.",
					en: "Developed Java and Spring Boot modules to integrate devices with varied message formats and uneven protocol standardization. Handled incoming device data, outgoing commands and remote firmware updates.",
				},
				skills: ["Java", "Spring Boot"],
				year: 2021,
				endYear: 2022,
				sortOrder: 2021.9,
				order: 2,
				main: true,
				date: {
					fr: "Fin 2021 – 2022",
					en: "Late 2021 – 2022",
				},
			},
			{
				id: "data-visualization",
				name: {
					fr: "Visualisation de données",
					en: "Data visualization",
				},
				kind: "professional",
				description: {
					fr: "Développement d'interfaces Angular pour explorer les données des équipements et leur historique au travers de cartes interactives, de graphiques et de tableaux personnalisables. Consultation détaillée des enregistrements et navigation entre les informations liées, avec OpenLayers pour les cartes et Chart.js pour les graphiques.",
					en: "Built Angular interfaces for exploring device data and history through interactive maps, charts and customizable tables. Enabled users to inspect records in detail and navigate related information, using OpenLayers for maps and Chart.js for charts.",
				},
				skills: ["Angular", "OpenLayers", "Chart.js"],
				year: 2022,
				sortOrder: 2022,
				order: 6,
				date: "2022",
			},
			{
				id: "observability",
				name: {
					fr: "Observabilité et outillage",
					en: "Observability and tooling",
				},
				kind: "professional",
				description: {
					fr: "Mise en place de l'observabilité applicative (métriques, taux d'erreur et logs avec OpenTelemetry, Prometheus, Loki et Grafana), et introduction des contrôles de qualité SonarQube, de règles ESLint plus strictes (dont des règles spécifiques à Angular) et d'environnements de développement basés sur Docker.",
					en: "Set up application observability (metrics, error rates and logs with OpenTelemetry, Prometheus, Loki and Grafana), and introduced SonarQube quality checks, stricter ESLint rules including Angular-specific ones, and Docker-based development environments.",
				},
				skills: ["OpenTelemetry", "Prometheus", "Loki", "Grafana", "SonarQube", "ESLint", "Docker"],
				year: 2023,
				endYear: 2025,
				sortOrder: 2023.1,
				order: 7,
				date: {
					fr: "2023 – 2025",
					en: "2023 – 2025",
				},
			},
			{
				id: "performance",
				name: {
					fr: "Performance et montée en charge",
					en: "Performance and scaling",
				},
				kind: "professional",
				description: {
					fr: "Montée en charge des traitements backend de ~10 000 à ~400 000 événements par jour en production, sur 2 vCPU et 4 à 8 Go de RAM, avec des tests de charge validant l'objectif d'un million par jour. Remplacement des requêtes N+1 et des accès répétés à la base par du batching et de la mise en cache, faisant passer le temps de traitement de 150–300 ms à environ 12 ms par événement, avec un traitement par lots de 100.",
					en: "Scaled backend processing from ~10,000 to ~400,000 events per day in production on 2 vCPUs and 4–8 GB of RAM, and load-tested it for a one-million-per-day requirement. Replaced N+1 queries and repeated database access with batching and caching, cutting processing time from 150–300 ms to roughly 12 ms per event, processed in batches of 100.",
				},
				skills: ["Java", "PostgreSQL", "Hibernate"],
				year: 2023,
				endYear: 2024,
				sortOrder: 2023.6,
				order: 5,
				date: {
					fr: "Mi-2023 – 2024",
					en: "Mid-2023 – 2024",
				},
			},
			{
				id: "architecture",
				name: {
					fr: "Architecture logicielle",
					en: "Software architecture",
				},
				kind: "professional",
				description: {
					fr: "Orientation des décisions d'architecture sur la plateforme et les applications clientes, en faisant évoluer les systèmes existants de manière incrémentale, notamment la transition en cours vers un monolithe modulaire. Documentation de l'architecture et des API, et rédaction de spécifications pour les fonctionnalités à venir.",
					en: "Guided architecture decisions across the platform and client applications, evolving existing systems incrementally, including the ongoing move to a modular monolith. Documented the architecture and APIs, and wrote specifications for upcoming features.",
				},
				skills: ["Java", "Spring Boot"],
				year: 2024,
				endYear: "present",
				sortOrder: 2024.9,
				order: 1,
				main: true,
				date: {
					fr: "Fin 2024 – Présent",
					en: "Late 2024 – Present",
				},
			},
		],
	},
];
