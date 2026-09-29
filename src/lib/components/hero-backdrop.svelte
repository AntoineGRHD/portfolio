<script lang="ts">
    import { onMount, onDestroy } from 'svelte';

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let observer: ResizeObserver;

    let bandWidth = 300;
    let bandGap = 60;
    const perspectiveMinScale = 0.2;
    const seamOverlap = 0.3;
    const lineCount = 7;
    const minLineIndex = -Math.floor(lineCount / 2);
    const maxLineIndex = Math.floor(lineCount / 2);
    const leftmostTargetRatio = 0.6;

    const colors: readonly string[] = [
        '#053b61',
        '#035c7e',
        '#55b3b2',
        '#f8c397',
        '#ee8c0f',
        '#b7170f',
        '#890a13'
    ];

    function resize(width: number, height: number): void {
        canvas.width = width;
        canvas.height = height;
        const widthScale = Math.min(canvas.width / 1440, 1);
        bandWidth = 92 + (92 * widthScale);
        bandGap = 18 + (26 * widthScale);

        draw();
    }

    function projectX(worldX: number, scale: number, centerX: number): number {
        return centerX + (worldX - centerX) * scale;
    }

    function draw(): void {
        const { width, height } = canvas;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, width, height);

        const bandStep = bandWidth + bandGap;
        const scaledBandWidth = bandWidth * perspectiveMinScale;
        const targetLeftmostLeft = width * leftmostTargetRatio;
        const centerForTarget =
            targetLeftmostLeft - minLineIndex * bandStep * perspectiveMinScale + scaledBandWidth / 2;
        const maxCenterBeforeRightOverflow =
            width - maxLineIndex * bandStep * perspectiveMinScale - scaledBandWidth / 2;
        const centerX = Math.min(centerForTarget, maxCenterBeforeRightOverflow);
        const bandStartY = height;
        const bandMask = new Path2D();

        for (let i = minLineIndex; i <= maxLineIndex; i++) {
            const worldX = centerX + i * bandStep;
            const color = colors[(i + 10) % colors.length];

            const scaleTop = perspectiveMinScale;

            const xTop = projectX(worldX, scaleTop, centerX);
            const wTop = bandWidth * scaleTop;

            /* ---------- wall ---------- */

            const bandPath = new Path2D();
            bandPath.moveTo(xTop - wTop / 2, bandStartY - seamOverlap);
            bandPath.lineTo(xTop + wTop / 2, bandStartY);
            bandPath.lineTo(xTop + wTop / 2 + height, 0);
            bandPath.lineTo(xTop - wTop / 2 + height, 0);
            bandPath.closePath();
            bandMask.addPath(bandPath);

            ctx.fillStyle = color;
            ctx.fill(bandPath);
        }

        /* ---------- wall shadow ---------- */
        ctx.save();
        ctx.clip(bandMask);

        const wallShadow = ctx.createLinearGradient(0, height, 0, 0);
        wallShadow.addColorStop(0, "rgba(0,0,0,0.8)");
        wallShadow.addColorStop(0.1, "rgba(0,0,0,0.5)");
        wallShadow.addColorStop(0.2, "rgba(0,0,0,0.3)");
        wallShadow.addColorStop(0.3, "rgba(0,0,0,0)");
        wallShadow.addColorStop(0.7, "rgba(0,0,0,0)");
        wallShadow.addColorStop(0.8, "rgba(0,0,0,0.3)");
        wallShadow.addColorStop(0.9, "rgba(0,0,0,0.5)");
        wallShadow.addColorStop(1, "rgba(0,0,0,0.8)");

        ctx.fillStyle = wallShadow;
        ctx.fillRect(0, 0, width, height);

        const textField = ctx.createLinearGradient(0, 0, width, 0);
        textField.addColorStop(0, "rgba(0,0,0,0.78)");
        textField.addColorStop(0.58, "rgba(0,0,0,0.56)");
        textField.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = textField;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
    }

    onMount(() => {
        ctx = canvas.getContext('2d')!;
        const parent = canvas.parentElement;

        if (!parent) {
            return;
        }

        observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            resize(Math.ceil(width), Math.ceil(height));
        });
        observer.observe(parent);
    });

    onDestroy(() => {
        observer?.disconnect();
    });
</script>

<canvas bind:this={canvas}></canvas>

<style>
    canvas {
        display: block;
        width: 100%;
        height: 100%;
    }
</style>
