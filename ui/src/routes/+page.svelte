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
				videoEl.currentTime = videoEl.duration - 0.5;
				player.play();
			}, 2000);
		}
	});
</script>

<div class="container">
	<video bind:this={videoEl} autoplay muted playsinline></video>
</div>

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
			videoEl.play();
			videoEl.currentTime = videoEl.duration - 0.5;
		}}>Live</button
	>

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

	.container {
		width: 100vw;
		height: calc(100vw / 16 * 9);
		background-color: #000;

		@media (min-aspect-ratio: 16 / 9) {
			width: calc(100vh * 16 / 9);
			height: 100vh;
		}

		video {
			width: 100%;
		}

		& > * {
			position: absolute;
		}
	}

	button {
		font-size: 1vw;
		font-weight: 500;
	}

	input[type='range'] {
		width: 10vw;
		height: 1vw;
		border-radius: 0.5vw;
		outline: none;
	}
</style>
