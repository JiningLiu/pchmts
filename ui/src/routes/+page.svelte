<script lang="ts">
	import { onMount } from 'svelte';

	let videoEl: HTMLVideoElement;

	onMount(async () => {
		const mpegts = (await import('mpegts.js')).default;

		if (mpegts.getFeatureList().mseLivePlayback && mpegts.isSupported()) {
			const player = mpegts.createPlayer({
				type: 'mpegts',
				url: `http://${location.hostname}:20240/pchmts`,
				isLive: true,
				cors: true
			});

			player.attachMediaElement(videoEl);
			player.load();
			setTimeout(() => {
				player.play();
			}, 2000);
		}
	});
</script>

<main>
	<container
		><video
			bind:this={videoEl}
			autoplay
			muted
			playsinline
			controls
			style="width: 100%; max-width: 100%;"
		></video></container
	>
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		background-color: #000;
		color: #fff;
		font-family: sans-serif;
	}

	main {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100vw;
		width: 100vh;
	}

	container {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100vw;
		height: calc(100vw / 16 * 9);
		background-color: #000;

		@media (min-aspect-ratio: 16 / 9) {
			width: calc(100vh * 16 / 9);
			height: 100vh;
		}
	}

	video {
		border: 2px solid #fff;
		border-radius: 8px;
	}
</style>
