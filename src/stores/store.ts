import { writable } from 'svelte/store';
import { signInWithPopup, signOut, type UserInfo } from 'firebase/auth';
import { auth, googleProvider } from '$lib/firebase/firebase';

export interface AuthUserData {
	email: string | null;
}
export interface AuthStore {
	user: UserInfo | null;
	data: AuthUserData;
}

export const authStore = writable<AuthStore>({
	user: null,
	data: {
		email: null
	}
});

export const authHandlers = {
	loginWithGoogle: async () => {
		await signInWithPopup(auth, googleProvider);
	},
	logout: async () => {
		await signOut(auth);
	}
};
