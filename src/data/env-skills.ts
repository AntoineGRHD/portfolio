import type { Skill } from "$data/skills";
import dockerIcon from "devicon/icons/docker/docker-plain.svg";
import fedoraIcon from "devicon/icons/fedora/fedora-plain.svg";
import gitIcon from "devicon/icons/git/git-plain.svg";
import jetbrainsIcon from "devicon/icons/jetbrains/jetbrains-plain.svg";

export const envSkills = [
	{
		name: "Docker",
		icon: dockerIcon,
	},
	{
		name: "Fedora",
		icon: fedoraIcon,
	},
	{
		name: "Git",
		icon: gitIcon,
	},
	{
		name: "JetBrains",
		icon: jetbrainsIcon,
	},
	{
		name: "Claude Code",
		/* devicon ships no AI marks, so this one is a local SVG */
		icon: "/images/icons/claude-code.svg",
	},
] satisfies Array<Skill>;