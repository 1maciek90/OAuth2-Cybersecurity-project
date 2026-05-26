import { roleNames } from "../../constants/dashboard";
import type { User } from "../../types";

interface DashboardHeaderProps {
	user: User;
	busy: boolean;
	onLogout: () => Promise<void>;
}

function DashboardHeader({ user, busy, onLogout }: DashboardHeaderProps) {
	const displayName = user.name ?? user.email;

	return (
		<header className="border-b border-slate-200 bg-white">
			<div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-6 py-5 lg:px-10">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">OAuth2 Access Lab</p>
					<h1 className="mt-1 text-2xl font-semibold tracking-tight">Dashboard publikacji</h1>
				</div>
				<div className="flex items-center gap-4">
					<div className="hidden text-right sm:block">
						<p className="font-medium">{displayName}</p>
						<p className="text-sm text-slate-500">{roleNames[user.role]}</p>
					</div>
					{user.picture ? (
						<img className="h-11 w-11 rounded-full border border-slate-200" src={user.picture} alt="" />
					) : (
						<div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 font-semibold text-white">
							{displayName.charAt(0).toUpperCase()}
						</div>
					)}
					<button
						type="button"
						disabled={busy}
						onClick={() => void onLogout()}
						className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium transition hover:border-slate-400 disabled:opacity-50"
					>
						Wyloguj
					</button>
				</div>
			</div>
		</header>
	);
}

export default DashboardHeader;
