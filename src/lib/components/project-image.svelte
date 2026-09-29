<script lang="ts">
	import ImageIcon from "@lucide/svelte/icons/image";
	import { m } from "$codegen/paraglide/messages.js";

	/* Opens the shot full screen. Self-contained: the open state never leaves this
	   component, so a section can drop one in wherever a project carries an image.
	   `plate` shows the shot inline where it earns the room; `icon` is a bare
	   trigger for entries where a screenshot would outweigh the entry itself. */
	let { src, alt, caption, meta, variant = "plate" }: {
		src: string;
		alt: string;
		caption: string;
		meta?: string;
		variant?: "plate" | "icon";
	} = $props();

	let open = $state(false);
	let closeButton = $state<HTMLButtonElement | null>(null);

	/* the page must not scroll behind the overlay, and focus has to land inside
	   it so Escape and Tab belong to the viewer while it is up */
	$effect(() => {
		if (!open) return;

		const previousOverflow = document.body.style.overflow;
		const previouslyFocused = document.activeElement as HTMLElement | null;
		document.body.style.overflow = "hidden";
		closeButton?.focus();

		return () => {
			document.body.style.overflow = previousOverflow;
			previouslyFocused?.focus();
		};
	});
</script>

<svelte:window onkeydown={(event) => open && event.key === "Escape" && (open = false)} />

{#if variant === "icon"}
	<button class="icon-trigger" type="button" onclick={() => (open = true)}>
		<ImageIcon size={14} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" />
		<span>{m.image_view()}</span>
	</button>
{:else}
	<button class="plate" type="button" onclick={() => (open = true)}>
		<img {src} {alt} loading="lazy" decoding="async" />
		<span class="hint" aria-hidden="true"></span>
		<span class="sr-only">{m.image_open()}</span>
	</button>
{/if}

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="viewer"
		role="dialog"
		aria-modal="true"
		aria-label={caption}
		tabindex="-1"
		onclick={() => (open = false)}
	>
		<button
			class="close"
			type="button"
			aria-label={m.modal_close()}
			bind:this={closeButton}
			onclick={() => (open = false)}
		>×</button>

		<!-- the figure swallows the click so only the surround dismisses -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<figure onclick={(event) => event.stopPropagation()}>
			<img {src} {alt} />
			<figcaption>
				<strong>{caption}</strong>
				{#if meta}
					<span>{meta}</span>
				{/if}
			</figcaption>
		</figure>
	</div>
{/if}

<style lang="scss">
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	/* No box: a labelled control in the caption voice, sitting on the skills row
	   opposite the chips — light orange against their light blue. */
	.icon-trigger {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		margin: 0;
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--accent-orange-light);
		cursor: pointer;
		font-family: inherit;
		font-size: var(--fs-caption);
		font-weight: 600;
		line-height: 1.5;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		transition: color 0.2s ease;

		&:hover,
		&:focus-visible {
			color: var(--accent-orange);
		}

		&:focus-visible {
			outline: 2px solid rgba(238, 140, 15, 0.35);
			outline-offset: 3px;
		}

		:global(svg) {
			display: block;
			flex: 0 0 auto;
		}
	}

	/* 16:9, sized to read as a reference rather than a feature */
	.plate {
		position: relative;
		display: block;
		width: 240px;
		max-width: 100%;
		margin: 4px 0 0;
		padding: 0;
		border: 1px solid var(--rule-item);
		background: var(--surface-bg-muted);
		cursor: pointer;
		line-height: 0;
		transition: border-color 0.2s ease;

		img {
			display: block;
			width: 100%;
			aspect-ratio: 16 / 9;
			object-fit: cover;
		}

		/* a corner tick, in the same angular voice as the section marks */
		.hint {
			position: absolute;
			right: 7px;
			bottom: 7px;
			width: 9px;
			height: 9px;
			border-top: 1.5px solid rgba(255, 255, 255, 0.62);
			border-right: 1.5px solid rgba(255, 255, 255, 0.62);
			transform: rotate(45deg);
			transition: border-color 0.2s ease;
		}

		&:hover,
		&:focus-visible {
			border-color: var(--accent-blue);

			.hint {
				border-color: var(--accent-blue);
			}
		}

		&:focus-visible {
			outline: 2px solid rgba(85, 179, 178, 0.3);
			outline-offset: 2px;
		}
	}

	.viewer {
		position: fixed;
		inset: 0;
		z-index: 90;
		display: grid;
		place-items: center;
		padding: 48px;
		background: rgba(0, 0, 0, 0.86);
		backdrop-filter: blur(8px);
	}

	figure {
		display: grid;
		gap: 16px;
		justify-items: start;
		margin: 0;
		max-width: 100%;

		img {
			display: block;
			max-width: 100%;
			/* leaves room for the legend under it */
			max-height: calc(100vh - 200px);
			object-fit: contain;
			border: 1px solid rgba(255, 255, 255, 0.16);
		}
	}

	figcaption {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 6px 14px;

		strong {
			color: white;
			font-size: var(--fs-body);
			font-weight: 600;
			line-height: 1.3;
		}

		span {
			color: rgba(255, 255, 255, 0.5);
			font-size: var(--fs-caption);
			font-weight: 600;
			line-height: 1.5;
			text-transform: uppercase;
			letter-spacing: 0.08em;
			font-variant-numeric: tabular-nums;
		}
	}

	.close {
		position: absolute;
		top: 18px;
		right: 18px;
		width: 36px;
		height: 36px;
		border: 1px solid rgba(255, 255, 255, 0.14);
		background: transparent;
		color: rgba(255, 255, 255, 0.72);
		cursor: pointer;
		font-size: 26px;
		/* a glyph sized to its 36px button, not a step on the text scale */
		line-height: 1;

		&:hover {
			background: white;
			color: black;
		}

		&:focus-visible {
			outline: 2px solid rgba(85, 179, 178, 0.3);
			outline-offset: 2px;
		}
	}

	@media (max-width: 639px) {
		.viewer {
			padding: 20px;
		}

		figure img {
			max-height: calc(100svh - 180px);
		}
	}
</style>
