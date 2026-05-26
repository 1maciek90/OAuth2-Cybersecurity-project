import { useEffect, useState } from "react";
import { ApiError, getCurrentUser } from "../api";
import type { User } from "../types";

export function useSession() {
	const [user, setUser] = useState<User | null>(null);
	const [checkingSession, setCheckingSession] = useState(true);
	const [sessionError, setSessionError] = useState<string | null>(null);

	useEffect(() => {
		getCurrentUser()
			.then((authenticatedUser) => {
				setUser(authenticatedUser);
				setSessionError(null);
			})
			.catch((error: unknown) => {
				setUser(null);
				if (error instanceof ApiError && error.status !== 401) {
					setSessionError(error.message);
				}
			})
			.finally(() => setCheckingSession(false));
	}, []);

	return {
		user,
		checkingSession,
		sessionError,
		clearUser: () => setUser(null),
	};
}
