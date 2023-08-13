<script lang="ts">
	import {
		CHESS_PIECE,
		INITIAL_BOARD_POSITION,
		INITIAL_PLAYER_INFO,
		PLAYER_BLACK,
		PLAYER_WHITE
	} from '$lib/chess/core';
	import { onMount } from 'svelte';
	import Button from '../../../components/Base/Button.svelte';
	import Disclosure from '../../../components/Base/Disclosure.svelte';
	import ChessBoard from '../../../components/Chess/ChessBoard.svelte';
	import { userHandlers, userStore } from '../../../stores/users';
	import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
	import { uuidv4 } from '$lib/utils/uuid';
	import { authStore } from '../../../stores/auth';
	import {
		RadioGroup,
		RadioGroupLabel,
		RadioGroupOption,
		RadioGroupDescription
	} from '@rgossiaux/svelte-headlessui';
	import Icon from '@iconify/svelte';
	import { db } from '$lib/firebase/firebase';
	import { goto } from '$app/navigation';

	let playAs = 1;
	let enemy: User | null = null;
	let time: number = 60;

	const timeOptions = [
		{
			label: '1 mnt',
			value: 60
		},
		{
			label: '3 mnt',
			value: 60 * 3
		},
		{
			label: '10 mnt',
			value: 60 * 10
		}
	];
	$: enemyOptions = $userStore.users.filter((u) => u.uid != $authStore.user?.uid);

	let isSubmitting = false;
	async function create() {
		if (!playAs || !enemy || !time) return;

		isSubmitting = true;
		const id = uuidv4();
		const chessInitialData: ChessInfo = {
			id: id,
			board: INITIAL_BOARD_POSITION,
			moveHistory: [],
			players: {
				1: {
					capturedPieces: [],
					time: time
				},
				2: {
					capturedPieces: [],
					time: time
				}
			},
			currentPlayer: PLAYER_WHITE,
			initialTime: time,
			playerWhite: playAs === PLAYER_WHITE ? $authStore.user : enemy,
			playerBlack: playAs === PLAYER_BLACK ? $authStore.user : enemy,
			moveCount: 1,
			winner: {
				player: null,
				type: null
			},
			createdAt: serverTimestamp()
		};

		let chessRef = doc(db, 'chess', id);
		await setDoc(chessRef, chessInitialData);

		isSubmitting = false;
		const url = `/chess/${id}`;
		goto(url);
	}

	onMount(async () => {
		if ($userStore.users.length === 0) {
			await userHandlers.getAllUsers();
		}
	});
</script>

<div class="flex gap-4">
	<ChessBoard board={INITIAL_BOARD_POSITION} />
	<div class="flex flex-col gap-4 bg-[#262522] p-4 rounded w-full">
		<div class="flex flex-col gap-4">
			<!-- TODO: Change with checkgroup component -->
			<div class="flex flex-col gap-2">
				<label for=""> Play As</label>
				<RadioGroup class="flex gap-2" bind:value={playAs}>
					<RadioGroupOption value={1} let:checked let:active>
						<div
							class="relative flex cursor-pointer rounded-lg px-5 py-4 shadow-md focus:outline-none border border-[#3c3b39] {checked
								? 'bg-[#312e2b] bg-opacity-75 text-white '
								: 'bg-[#262522] '} {active
								? 'ring-2 ring-white ring-opacity-60 ring-offset-2 ring-offset-sky-300 312e2b'
								: ''}"
						>
							<div class="flex w-full items-center justify-between">
								<div class="flex items-center">
									<div class="text-sm flex flex-col gap-2 items-center">
										<RadioGroupLabel
											as="p"
											class="font-medium {checked ? 'text-white' : 'text-gray-900'}"
										>
											<Icon
												icon={CHESS_PIECE.king.icon}
												class="w-20 h-20 duration-300 pt-2 text-black"
											/>
										</RadioGroupLabel>
										<RadioGroupDescription
											as="span"
											class="inline {checked ? 'text-sky-100' : 'text-gray-500'}"
										>
											<span>Black</span>
										</RadioGroupDescription>
									</div>
								</div>
								{#if checked}
									<div class="shrink-0 text-white absolute -top-2 -right-2">
										<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none">
											<circle cx="12" cy="12" r="12" fill="#fff" fill-opacity="0.2" />
											<path
												d="M7 13l3 3 7-7"
												stroke="#fff"
												stroke-width="1.5"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</svg>
									</div>
								{/if}
							</div>
						</div>
					</RadioGroupOption>
					<RadioGroupOption value={2} let:checked let:active>
						<div
							class="relative flex cursor-pointer rounded-lg px-5 py-4 shadow-md focus:outline-none border border-[#3c3b39] {checked
								? 'bg-[#312e2b] bg-opacity-75 text-white '
								: 'bg-[#262522] '} {active
								? 'ring-2 ring-white ring-opacity-60 ring-offset-2 ring-offset-sky-300 312e2b'
								: ''}"
						>
							<div class="flex w-full items-center justify-between">
								<div class="flex items-center">
									<div class="text-sm flex flex-col gap-2 items-center">
										<RadioGroupLabel
											as="p"
											class="font-medium {checked ? 'text-white' : 'text-gray-900'}"
										>
											<Icon
												icon={CHESS_PIECE.king.icon}
												class="w-20 h-20 duration-300 pt-2 text-white"
											/>
										</RadioGroupLabel>
										<RadioGroupDescription
											as="span"
											class="inline {checked ? 'text-sky-100' : 'text-gray-500'}"
										>
											<span>White</span>
										</RadioGroupDescription>
									</div>
								</div>
								{#if checked}
									<div class="shrink-0 text-white absolute -top-2 -right-2">
										<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none">
											<circle cx="12" cy="12" r="12" fill="#fff" fill-opacity="0.2" />
											<path
												d="M7 13l3 3 7-7"
												stroke="#fff"
												stroke-width="1.5"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</svg>
									</div>
								{/if}
							</div>
						</div>
					</RadioGroupOption>
				</RadioGroup>
			</div>
			<!-- TODO: Change disclosure with select -->
			<div class="flex flex-col gap-2">
				<label for=""> Versus </label>
				<Disclosure let:close>
					<div slot="title">
						{#if enemy}
							<span class="text-white">{enemy.displayName}</span>
						{:else}
							<span class="text-slate-300">Choose Player</span>
						{/if}
					</div>
					<ul class="bg-[#312e2b] mt-2 rounded">
						{#if enemyOptions.length === 0}
							<li class="p-2 flex gap-2 items-center w-full text-center">No Enemy Available</li>
						{:else}
							{#each enemyOptions as enemyOption}
								<li>
									<Button
										variant="unstyled"
										class="p-2 flex gap-2 items-center w-full {enemy === enemyOption
											? 'border-2 border-[#81b64c]'
											: ''}"
										on:click={() => {
											enemy = enemyOption;
											close();
										}}
									>
										<img src={enemyOption.photoURL} alt="" class="w-6 h-6 rounded-full" />
										<div class="">
											{enemyOption.displayName}
										</div>
									</Button>
								</li>
							{/each}
						{/if}
					</ul>
				</Disclosure>
			</div>
			<!-- TODO: Change disclosure with select -->
			<div class="flex flex-col gap-2">
				<label for=""> Time </label>
				<Disclosure let:close>
					<div slot="title">
						{#if time}
							<span class="text-white">{time}</span>
						{:else}
							<span class="text-slate-300">Choose Time</span>
						{/if}
					</div>
					<ul class="bg-[#312e2b] mt-2 rounded">
						{#each timeOptions as timeOption}
							<li>
								<Button
									variant="unstyled"
									class="p-2 flex gap-2 items-center w-full {time === timeOption.value
										? 'border-2 border-[#81b64c]'
										: ''}"
									on:click={() => {
										time = timeOption.value;
										close();
									}}
								>
									<div class="">
										{timeOption.label}
									</div>
								</Button>
							</li>
						{/each}
					</ul>
				</Disclosure>
			</div>
		</div>
		<div>
			<Button class="w-full" disabled={isSubmitting} on:click={() => create()}>Create</Button>
		</div>
	</div>
</div>
