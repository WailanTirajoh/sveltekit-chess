import { db } from '$lib/firebase/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { writable } from 'svelte/store';

export interface UserStore {
	users: Array<User>;
}

export const userStore = writable<UserStore>({
	users: []
});

export const userHandlers = {
	// Get users.
	getAllUsers: async () => {
		const userRef = query(collection(db, 'users'));
		const docSnap = await getDocs(userRef);
		const users: Array<User> = [];
		docSnap.forEach((doc) => {
			const user = doc.data() as User;
			users.push(user);
		});
		userStore.set({
			users: users
		});
	}
};
