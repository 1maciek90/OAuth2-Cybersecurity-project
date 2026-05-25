import { useEffect, useState } from "react";
import { ApiError, getCurrentUser } from "./api";
import Dashboard from "./components/Dashboard";
import LoginPage from "./components/LoginPage";
import type { User } from "./types";

function App() {
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

	if (checkingSession) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
				<div className="text-center">
					<div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
					<p>Sprawdzanie bezpiecznej sesji...</p>
				</div>
			</div>
		);
	}

	if (user) {
		return <Dashboard user={user} onLogout={() => setUser(null)} />;
	}

	return (
		<>
			{sessionError && (
				<p className="fixed left-1/2 top-6 z-10 -translate-x-1/2 rounded-xl bg-rose-100 px-5 py-3 text-sm text-rose-700 shadow-lg">
					{sessionError}
				</p>
			)}
			<LoginPage />
		</>
	);
}

export default App;
