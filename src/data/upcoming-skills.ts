import type { Skill } from "$data/skills";
import scalaIcon from "devicon/icons/scala/scala-plain.svg";
import rustIcon from "devicon/icons/rust/rust-original.svg";
import svelteIcon from "devicon/icons/svelte/svelte-plain.svg";

export const upcomingSkills = [
	{
		name: "Scala",
		icon: scalaIcon,
	},
	{
		name: "Rust",
		icon: rustIcon,
	},
	{
		name: "Svelte",
		icon: svelteIcon,
	},
] satisfies Array<Skill>;