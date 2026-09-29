<script lang="ts">
	import Briefcase from "@lucide/svelte/icons/briefcase";
	import FolderCode from "@lucide/svelte/icons/folder-code";
	import GraduationCap from "@lucide/svelte/icons/graduation-cap";
	import Mail from "@lucide/svelte/icons/mail";
	import User from "@lucide/svelte/icons/user";
	import { m } from "$codegen/paraglide/messages.js";
	import ParaglideSwitch from "$lib/components/paraglide-switch.svelte";

	const links = [
		{ href: "#profile", label: () => m.nav_profile(), icon: User },
		{ href: "#current-experience", label: () => m.nav_experiences(), icon: Briefcase },
		{ href: "#formation", label: () => m.nav_formation(), icon: GraduationCap },
		{ href: "#personal-projects", label: () => m.nav_projects(), icon: FolderCode },
		{ href: "#contact", label: () => m.nav_contact(), icon: Mail },
	];

	/* matches the scroll-margin-top the page sets on every section anchor */
	const navOffset = 88;

	let activeHref = $state(links[0].href);

	/* Enough marks to overrun the gap at any width; the run is right-aligned and
	   the overflow is faded out on the left, so no mark is ever cut off. */
	const runTicks = Array.from({ length: 72 });

	const scrollDuration = 420;
	const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (2 - 2 * t) ** 2 / 2);

	// mobile docks the nav and scrolls <main>; desktop still scrolls the window
	function findScroller(element: Element): HTMLElement | null {
		for (let node = element.parentElement; node; node = node.parentElement) {
			const { overflowY } = getComputedStyle(node);
			if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight) {
				return node;
			}
		}
		return null;
	}

	/* Which section owns the viewport. Read from geometry rather than an
	   IntersectionObserver so the last section still claims the bar when it is
	   too short to ever reach the offset line. */
	function measure() {
		const sections = links
			.map((link) => ({ href: link.href, element: document.querySelector(link.href) }))
			.filter((entry): entry is { href: string; element: Element } => entry.element !== null);
		if (!sections.length) return;

		const scroller = findScroller(sections[0].element);
		const scrollTop = scroller ? scroller.scrollTop : window.scrollY;
		const maxScroll = scroller
			? scroller.scrollHeight - scroller.clientHeight
			: document.documentElement.scrollHeight - window.innerHeight;

		const scrollerTop = scroller ? scroller.getBoundingClientRect().top : 0;
		let current = 0;
		sections.forEach((section, index) => {
			if (section.element.getBoundingClientRect().top - scrollerTop <= navOffset + 1) {
				current = index;
			}
		});

		// the tail of the page belongs to the last entry, however short it is
		const atEnd = maxScroll > 0 && maxScroll - scrollTop < 2;
		activeHref = sections[atEnd ? sections.length - 1 : current].href;
	}

	$effect(() => {
		let frame = 0;
		const schedule = () => {
			if (frame) return;
			frame = requestAnimationFrame(() => {
				frame = 0;
				measure();
			});
		};

		measure();
		// capture, because on mobile it is <main> that scrolls, not the window
		document.addEventListener("scroll", schedule, { capture: true, passive: true });
		window.addEventListener("resize", schedule, { passive: true });
		// expanding "more contributions" moves every section below it
		const observer = new ResizeObserver(schedule);
		observer.observe(document.body);

		return () => {
			document.removeEventListener("scroll", schedule, { capture: true });
			window.removeEventListener("resize", schedule);
			observer.disconnect();
			if (frame) cancelAnimationFrame(frame);
		};
	});

	function scrollToSection(event: MouseEvent, href: string) {
		const target = document.querySelector(href);
		if (!target) return;

		event.preventDefault();
		history.replaceState(null, "", href);

		const scroller = findScroller(target);
		// scroll-margin-top lives in the page CSS, so read it back rather than duplicating it here
		const offset = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;

		const from = scroller ? scroller.scrollTop : window.scrollY;
		const maxScroll = scroller
			? scroller.scrollHeight - scroller.clientHeight
			: document.documentElement.scrollHeight - window.innerHeight;
		// distances are measured against the scroller's own box, not always the viewport
		const scrollerTop = scroller ? scroller.getBoundingClientRect().top : 0;
		const delta = target.getBoundingClientRect().top - scrollerTop - offset;
		const to = Math.max(0, Math.min(from + delta, maxScroll));

		const applyScroll = (position: number) => {
			if (scroller) scroller.scrollTop = position;
			else window.scrollTo(0, position);
		};

		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			applyScroll(to);
			return;
		}

		const start = performance.now();
		const step = (now: number) => {
			const progress = Math.min((now - start) / scrollDuration, 1);
			applyScroll(from + (to - from) * easeInOutQuad(progress));
			if (progress < 1) requestAnimationFrame(step);
		};
		requestAnimationFrame(step);
	}
</script>

<nav class="home-nav" aria-label={m.nav_label()}>
	<div class="nav-inner">
		<div class="section-links">
			{#each links as link (link.href)}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- in-page anchors, not routes -->
				<a href={link.href}
					aria-current={activeHref === link.href ? "true" : undefined}
					onclick={(event) => scrollToSection(event, link.href)}
				>{link.label()}</a>
			{/each}
		</div>
		<span class="run" aria-hidden="true">
			{#each runTicks, tick (tick)}
				<i></i>
			{/each}
		</span>

		<ParaglideSwitch />
	</div>
</nav>

<!-- five labels no longer fit a phone width, so the docked bar goes icon-only -->
<nav class="bottom-nav" aria-label={m.nav_label()}>
	{#each links as link (link.href)}
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- in-page anchors, not routes -->
		<a href={link.href}
			aria-label={link.label()}
			aria-current={activeHref === link.href ? "true" : undefined}
			onclick={(event) => scrollToSection(event, link.href)}
		><link.icon size={24} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" /></a>
	{/each}
</nav>

<style lang="scss">
	/* Seamless: the bar shares the page's ground and draws no edge, so content
	   simply passes behind it. Its contents sit in the same column the sections
	   use, so the links line up with the page grid. */
	.home-nav {
		position: fixed;
		inset: 0 0 auto;
		z-index: 50;
		padding: 0 var(--page-gutter);
		background: var(--page-bg);
	}

	.nav-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		width: min(var(--page-column), 100%);
		margin: 0 auto;
	}

	/* The same run the section markers draw, holding the space between the links
	   and the switch: packed right, overflowing left, faded out where it does. */
	.run {
		display: flex;
		justify-content: flex-end;
		gap: 7px;
		/* basis 0, so 72 marks of content never enter the layout calculation —
		   the run only ever absorbs space the real content has already taken */
		flex: 1 1 0;
		min-width: 0;
		overflow: hidden;
		/* the skew throws the top corner past the box, so the clip sits outside it */
		padding-right: 6px;
		mask-image: linear-gradient(to right, transparent 0, #000 64px);

		i {
			display: block;
			flex: 0 0 auto;
			width: 4px;
			height: var(--marker-tick);
			background: linear-gradient(to right, #2f2f2f 0 2px, transparent 2px);
			transform: skewX(-28deg);
		}
	}

	.section-links {
		display: flex;
		align-items: center;
		gap: 2px;
		/* never shrink: the links are flex: 0 0 auto, so shrinking this box makes
		   them overflow it rather than reflow */
		flex: 0 0 auto;
	}

	.section-links a {
		flex: 0 0 auto;
		padding: 17px 14px;
		color: rgba(255, 255, 255, 0.5);
		font-size: var(--fs-small);
		font-weight: 600;
		line-height: 1;
		text-decoration: none;
		text-transform: uppercase;
		/* the colour easing is what reads as movement while the page scrolls */
		transition: color 0.25s ease;

		&:hover {
			color: white;
		}

		/* declared after :hover so the section you are in keeps its colour */
		&[aria-current] {
			color: var(--accent-blue-light);
		}

		&:focus-visible {
			outline: 2px solid rgba(85, 179, 178, 0.3);
			outline-offset: -4px;
		}
	}

	.bottom-nav {
		display: none;
		padding: 6px 10px max(10px, env(safe-area-inset-bottom));
		background: var(--page-bg);
		border-top: 1px solid rgba(255, 255, 255, 0.12);

		a {
			display: flex;
			justify-content: center;
			flex: 1 1 0;
			min-width: 0;
			padding: 12px 2px;
			color: rgba(255, 255, 255, 0.42);
			transition: color 0.25s ease;

			&:hover,
			&:active {
				color: white;
			}

			&[aria-current] {
				color: var(--accent-blue-light);
			}
		}
	}

	/* the full-size row needs ~670px; step it down before the column gets there */
	@media (max-width: 899px) {
		.section-links a {
			padding: 15px 11px;
			font-size: var(--fs-caption);
		}
	}

	/* the locale switch moves into the hero, so it scrolls away instead of
	   floating over the text */
	@media (max-width: 639px) {
		.home-nav {
			display: none;
		}

		.bottom-nav {
			display: flex;
			/* it precedes <main> in the DOM for tab order, so move it visually below */
			order: 1;
			flex: 0 0 auto;
		}
	}
</style>
