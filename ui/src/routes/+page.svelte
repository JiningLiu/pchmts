<script lang="ts">
	import type Mpegts from 'mpegts.js';
	import { onMount, onDestroy } from 'svelte';

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

	let buffer = 0.5;

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
				videoEl.currentTime = videoEl.duration - buffer;
				player.play();
			}, 2500);
		}
	});
</script>

<!-- svelte-ignore a11y_media_has_caption -->
<video bind:this={videoEl} autoplay playsinline></video>

{#if videoEl}
	<button
		tabindex="0"
		on:click={() => {
			if (videoEl.paused) {
				videoEl.play();
			} else {
				videoEl.pause();
			}
		}}>Play/Pause</button
	>

	<button
		tabindex="0"
		on:click={() => {
			videoEl.currentTime = videoEl.duration - buffer;
			videoEl.play();
		}}>Live</button
	>

	<br />

	<label for="buffer">Buffer (s)</label>

	<input
		tabindex="0"
		type="number"
		name="buffer"
		id="buffer"
		bind:value={buffer}
		min="0"
		max="10"
		step="0.1"
	/>

	<br />

	<label for="volume"
		>Volume: {String(Math.round(videoEl.volume * 100) / 100)
			.padEnd(2, '.')
			.padEnd(4, '0')}</label
	>

	<input
		tabindex="0"
		type="range"
		name="volume"
		id="volume"
		min="0"
		max="1"
		bind:value={videoEl.volume}
		step="0.01"
	/>
{/if}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		width: 100vw;
		height: 100vh;
		background-color: #000;
		color: #fff;
		font-family: sans-serif;
		overflow: hidden;
	}

	video {
		width: 100vw;
		height: calc(100vw / 16 * 9);
	}

	button {
		font-size: 1vw;
		font-weight: 500;
	}

	label {
		font-size: 1vw;
	}

	input[type='range'] {
		width: 10vw;
		height: 1vw;
		border-radius: 0.5vw;
		outline: none;
	}
</style>
