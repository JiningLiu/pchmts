<script lang="ts">
	import type Mpegts from 'mpegts.js';
	import { onMount } from 'svelte';

	let mpegts: {
		getFeatureList: any;
		isSupported: any;
		createPlayer: any;
		BaseLoader?: Mpegts.BaseLoaderConstructor;
		LoaderStatus?: Mpegts.LoaderStatus;
		LoaderErrors?: Mpegts.LoaderErrors;
		version?: string;
		Events?: Readonly<Mpegts.Events>;
		ErrorTypes?: Readonly<Mpegts.ErrorTypes>;
		ErrorDetails?: Readonly<Mpegts.ErrorDetails>;
		MSEPlayer?: Mpegts.PlayerConstructor<Mpegts.MSEPlayer>;
		NativePlayer?: Mpegts.PlayerConstructor<Mpegts.NativePlayer>;
		LoggingControl?: Mpegts.LoggingControl;
	};

	let videoEl: HTMLVideoElement;

	onMount(async () => {
		mpegts = (await import('mpegts.js')).default;

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

	function reload() {
		location.reload();
	}
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

	<button on:click={reload}>Reload</button>
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		width: 100vw;
		height: 100vh;
		background-color: #000;
		color: #fff;
		font-family: sans-serif;
	}

	main {
		overflow: hidden;
		width: 100vw;
		height: 100vh;
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
</style>
