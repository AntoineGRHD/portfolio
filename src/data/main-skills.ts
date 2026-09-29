import type { Skill } from "$data/skills";
import javaIcon from "devicon/icons/java/java-plain.svg";
import springIcon from "devicon/icons/spring/spring-original.svg";
import typescriptIcon from "devicon/icons/typescript/typescript-plain.svg";
import angularIcon from "devicon/icons/angular/angular-plain.svg";
import nodejsIcon from "devicon/icons/nodejs/nodejs-plain.svg";
import postgresqlIcon from "devicon/icons/postgresql/postgresql-plain.svg";

export const mainSkills = [
	{
		name: "Java",
		icon: javaIcon,
	},
	{
		name: "Spring Boot",
		icon: springIcon,
	},
	{
		name: "TypeScript",
		icon: typescriptIcon,
	},
	{
		name: "Angular",
		icon: angularIcon,
	},
	{
		name: "Node.js",
		icon: nodejsIcon,
	},
	{
		name: "PostgreSQL",
		icon: postgresqlIcon,
	},
] satisfies Array<Skill>;