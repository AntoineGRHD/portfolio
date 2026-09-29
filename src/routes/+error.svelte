<script lang="ts">
	import { page } from "$app/state";
	import { resolve } from "$app/paths";
	import { m } from "$codegen/paraglide/messages.js";
	import { localizeHref } from "$codegen/paraglide/runtime.js";
	import SectionMarker from "$lib/components/section-marker.svelte";

	const notFound = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{notFound ? m.error_not_found_title() : m.error_generic_title()}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="error-page">
	<div class="section-inner">
		<SectionMarker index={String(page.status)} />
		<h1>{notFound ? m.error_not_found_title() : m.error_generic_title()}</h1>
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- resolved, then prefixed with the locale -->
		<a href={localizeHref(resolve("/"))}>{m.error_back_home()}</a>
	</div>
</main>

<style lang="scss">
	.error-page {
		min-height: 100svh;
		display: flex;
		align-items: center;
		padding: var(--section-space) var(--page-gutter);
		box-sizing: border-box;
		background: var(--section-bg);
		color: white;
	}

	.section-inner {
		width: min(var(--page-column), 100%);
		margin: 0 auto;
	}

	h1 {
		margin: 0 0 24px;
		font-size: var(--fs-title);
		font-weight: 700;
		line-height: 1.1;
	}

	a {
		color: var(--accent-blue-light);
		font-size: var(--fs-body);
		font-weight: 600;
		text-decoration: none;

		&:hover {
			color: white;
		}
	}
</style>
