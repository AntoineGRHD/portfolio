import { getLocale } from "$codegen/paraglide/runtime.js";

export type ProjectKind = "university" | "internship" | "personal" | "professional";
export type LocalizedText = string | { en: string; fr: string };

/** A discrete piece of work done inside a project or role. */
export type Contribution = {
	id: string;
	name: LocalizedText;
	description?: LocalizedText;
	skills?: string[];
};

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
	/** Work done inside this project, listed under it in the compact register. */
	contributions?: Contribution[];
};

export type Mission = {
	label: LocalizedText;
	/** Display rank within the occupation, lowest first. Independent of array position. */
	order: number;
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
	missions?: Mission[];
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

export function sortMissions(missions: Mission[]): Mission[] {
	return [...missions].sort((a, b) => a.order - b.order);
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
		missions: [
			{
				label: {
					fr: "Développement fullstack",
					en: "Fullstack development",
				},
				order: 1,
			},
			{
				label: {
					fr: "Système et réseau",
					en: "Systems and networking",
				},
				order: 2,
			},
			{
				label: {
					fr: "Bases de données relationnelles",
					en: "Relational databases",
				},
				order: 3,
			},
			{
				label: {
					fr: "Génie logiciel et modélisation objet",
					en: "Software engineering and object modeling",
				},
				order: 4,
			},
			{
				label: {
					fr: "Design et IHM",
					en: "UI design and HCI",
				},
				order: 5,
			},
		],
		projects: [
			{
				id: "cerhio",
				name: {
					fr: "CERHIO - Globe historique",
					en: "CERHIO - Historical globe",
				},
				kind: "university",
				description: {
					fr: "Conception et réalisation d'une application web interactive pour visualiser les trajets historiques de la Compagnie des Indes sur un globe.",
					en: "Designed and built an interactive web application to visualize historical French East India Company routes on a globe.",
				},
				skills: ["HTML", "CSS", "JavaScript"],
				image: "/images/projects/tabnum/canvas.webp",
				year: 2015,
				endYear: 2016,
				sortOrder: 2015.9,
				date: "2015 – 2016",
			},
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
		missions: [
			{
				label: {
					fr: "Développement fullstack",
					en: "Fullstack development",
				},
				order: 1,
			},
			{
				label: {
					fr: "Bases de données relationnelles",
					en: "Relational databases",
				},
				order: 2,
			},
			{
				label: {
					fr: "Génie logiciel et modélisation objet",
					en: "Software engineering and object modeling",
				},
				order: 3,
			},
		],
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
					fr: "Évaluation de Google Earth Engine par rapport aux outils existants de l'équipe de recherche. Sélection des traitements à comparer avec les chercheurs, réimplémentation sur la plateforme, puis mesure des performances et présentation des résultats.",
					en: "Evaluated Google Earth Engine against the research team’s existing tools. Worked with researchers to select the processing tasks to compare, reimplemented them on the platform, and measured and reported their performance.",
				},
				skills: ["JavaScript", "Python"],
				contributions: [
					{
						id: "irisa-scope",
						name: { fr: "Échanges avec l'équipe scientifique", en: "Work with the scientific team" },
						description: {
							fr: "Identification des traitements existants de l'équipe que l'étude devait couvrir.",
							en: "Established which of the team's existing workloads the study needed to cover.",
						},
					},
					{
						id: "irisa-algorithms",
						name: { fr: "Implémentation des algorithmes", en: "Algorithm implementation" },
						description: {
							fr: "Réimplémentation sur la plateforme des traitements que l'équipe utilisait déjà.",
							en: "Reimplemented the processing the team already used, this time on the platform.",
						},
					},
					{
						id: "irisa-benchmark",
						name: { fr: "Comparaison des performances", en: "Performance comparison" },
						description: {
							fr: "Comparaison des performances des traitements sur Google Earth Engine et avec les outils existants, puis présentation des résultats à l'équipe.",
							en: "Compared processing performance on Google Earth Engine with the team's existing tools and presented the results.",
						},
					},
				],
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
		missions: [
			{
				label: {
					fr: "Développement web et mobile",
					en: "Web and mobile development",
				},
				order: 1,
			},
			{
				label: {
					fr: "Calcul distribué",
					en: "Distributed computing",
				},
				order: 2,
			},
			{
				label: "Machine Learning / Deep Learning",
				order: 3,
			},
			{
				label: {
					fr: "Programmation fonctionnelle",
					en: "Functional programming",
				},
				order: 4,
			},
			{
				label: {
					fr: "Cybersécurité et cryptographie",
					en: "Cybersecurity and cryptography",
				},
				order: 5,
			},
		],
		projects: [
			{
				id: "irisa-leapmotion",
				name: "IRISA - LeapMotion Classifier",
				kind: "university",
				description: {
					fr: "Entraînement et validation d'un classifieur SVM pour reconnaître différents types de mouvements à partir des coordonnées captées par une caméra LeapMotion.",
					en: "Trained and validated an SVM classifier to recognize movement types from coordinates captured by a LeapMotion camera.",
				},
				skills: ["Python", "Matplotlib"],
				image: "/images/projects/unity-leapmotion/unity-leapmotion.webp",
				year: 2017,
				endYear: 2018,
				sortOrder: 2017.9,
				date: "2017 – 2018",
			},
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
					fr: "Conception et développement d'une application web permettant à une équipe statistique de consulter et modifier la description de ses jeux de données. Création de vues Jade rendues côté serveur et de formulaires générés à partir des champs définis par l'équipe, en adaptant l'application à l'évolution de leur structure.",
					en: "Designed and built a web application for a statistics team to view and edit descriptions of its datasets. Built server-rendered Jade views and generated input forms from the fields defined by the team, adapting the application as their structure evolved.",
				},
				skills: ["Jade", "Node.js", "MongoDB", "Docker"],
				contributions: [
					{
						id: "seed-ssr",
						name: { fr: "Rendu côté serveur", en: "Server-side rendering" },
						description: {
							fr: "Développement de vues Jade rendues côté serveur pour consulter la description des jeux de données.",
							en: "Built server-rendered Jade views to browse dataset descriptions.",
						},
					},
					{
						id: "seed-schema",
						name: { fr: "Gestion des évolutions de schéma", en: "Schema change management" },
						description: {
							fr: "Adaptation des vues et formulaires aux changements des champs et de leur structure.",
							en: "Updated views and forms as the fields and their structure changed.",
						},
					},
					{
						id: "seed-dynamic-forms",
						name: { fr: "Formulaires dynamiques", en: "Dynamic forms" },
						description: {
							fr: "Génération des formulaires de saisie à partir de la définition des champs.",
							en: "Generated input forms from field definitions.",
						},
					},
				],
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
		missions: [
			{
				label: {
					fr: "Apprentissage de React et de l'écosystème frontend moderne",
					en: "Learning React and the modern frontend ecosystem",
				},
				order: 1,
			},
			{
				label: {
					fr: "Approfondissement d'Angular et de TypeScript",
					en: "Deeper work with Angular and TypeScript",
				},
				order: 2,
			},
			{
				label: {
					fr: "Découverte de Spring Boot et des architectures backend Java",
					en: "Exploration of Spring Boot and Java backend architectures",
				},
				order: 3,
			},
			{
				label: {
					fr: "Projets personnels et contributions open source",
					en: "Personal projects and open-source contributions",
				},
				order: 4,
			},
		],
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
				order: 6,
				date: {
					fr: "Mi-2025 – Présent",
					en: "Mid-2025 – Present",
				},
			},
			{
				id: "iot",
				name: {
					fr: "Modules IoT",
					en: "IoT Modules",
				},
				kind: "professional",
				description: {
					fr: "Développement de modules de communication en Java et Spring Boot pour connecter les équipements terrain à la plateforme et intégrer leurs données aux applications.",
					en: "Developed communication modules in Java and Spring Boot to connect field devices to the platform and integrate their data into the applications.",
				},
				skills: ["Java", "Spring Boot"],
				year: 2021,
				endYear: 2022,
				sortOrder: 2021.9,
				order: 3,
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
					fr: "Développement d'interfaces Angular pour présenter les données dans des tableaux, des cartes OpenLayers et des graphiques Chart.js.",
					en: "Built Angular interfaces to present data in tables, OpenLayers maps, and Chart.js charts.",
				},
				skills: ["Angular", "OpenLayers", "Chart.js"],
				year: 2022,
				sortOrder: 2022,
				order: 4,
				date: "2022",
			},
			{
				id: "observability",
				name: {
					fr: "Observabilité applicative",
					en: "Application observability",
				},
				kind: "professional",
				description: {
					fr: "Mise en place d'une observabilité applicative couvrant les métriques, le taux d'erreur et les logs, avec OpenTelemetry, Prometheus, Loki et Grafana.",
					en: "Set up application observability for metrics, error rates, and logs using OpenTelemetry, Prometheus, Loki, and Grafana.",
				},
				skills: ["OpenTelemetry", "Prometheus", "Loki", "Grafana"],
				year: 2023,
				sortOrder: 2023.1,
				order: 5,
				date: {
					fr: "Début 2023",
					en: "Early 2023",
				},
			},
			{
				id: "performance",
				name: {
					fr: "Optimisation des performances",
					en: "Performance optimization",
				},
				kind: "professional",
				description: {
					fr: "Optimisation des requêtes PostgreSQL et des traitements Java côté serveur.",
					en: "Optimized PostgreSQL queries and server-side Java processing.",
				},
				skills: ["Java", "PostgreSQL", "Hibernate"],
				year: 2023,
				endYear: 2024,
				sortOrder: 2023.6,
				order: 2,
				main: true,
				date: {
					fr: "Mi-2023 – 2024",
					en: "Mid-2023 – 2024",
				},
			},
			{
				id: "architecture",
				name: {
					fr: "Architecture modulaire",
					en: "Modular architecture",
				},
				kind: "professional",
				description: {
					fr: "Participation à la transition de la plateforme vers un monolithe modulaire. En parallèle, mise en place de contrôles de qualité du code avec SonarQube et d'environnements de développement avec Docker.",
					en: "Helped transition the platform to a modular monolith. Alongside this work, introduced SonarQube for code quality checks and Docker-based development environments.",
				},
				skills: ["Java", "Spring Boot", "SonarQube", "Docker"],
				year: 2024,
				endYear: 2025,
				sortOrder: 2024.9,
				order: 1,
				main: true,
				date: {
					fr: "Fin 2024 – 2025",
					en: "Late 2024 – 2025",
				},
			},
			{
				id: "documentation",
				name: {
					fr: "Documentation technique",
					en: "Technical documentation",
				},
				kind: "professional",
				description: {
					fr: "Rédaction de documentation d'API et d'architecture, ainsi que de documents préparant l'implémentation de nouvelles fonctionnalités.",
					en: "Wrote API and architecture documentation and technical specifications for upcoming features.",
				},
				skills: ["LaTeX"],
				year: 2025,
				sortOrder: 2025,
				order: 7,
				date: "2025",
			},
		],
	},
];
