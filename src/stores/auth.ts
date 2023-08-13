import { writable } from 'svelte/store';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '$lib/firebase/firebase';

export interface AuthStore {
	user: User | null;
}

export const authStore = writable<AuthStore>({
	user: null
});

export const authHandlers = {
	loginWithGoogle: async () => {
		await signInWithPopup(auth, googleProvider);
	},
	logout: async () => {
		await signOut(auth);
	}
};
