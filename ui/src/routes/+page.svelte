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
			}, 1000);
		}
	});
</script>

<video bind:this={videoEl} autoplay muted playsinline controls style="width: 100%; max-width: 100%;"
></video>
