import SessionLoading from "./components/common/SessionLoading";
import { useSession } from "./hooks/useSession";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";

function App() {
	const { user, checkingSession, sessionError, clearUser } = useSession();

	if (checkingSession) {
		return <SessionLoading />;
	}

	if (user) {
		return <DashboardPage user={user} onLogout={clearUser} />;
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
