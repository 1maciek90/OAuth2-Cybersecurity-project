import type { User, UserRole } from "../../types";

interface UsersPanelProps {
	currentUser: User;
	users: User[];
	busy: boolean;
	onRoleChange: (user: User, role: UserRole) => Promise<void>;
	onActiveToggle: (user: User) => Promise<void>;
}

function UsersPanel({ currentUser, users, busy, onRoleChange, onActiveToggle }: UsersPanelProps) {
	return (
		<div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
			<div className="border-b border-slate-100 px-6 py-5">
				<h2 className="text-xl font-semibold">Zarządzanie użytkownikami</h2>
				<p className="mt-1 text-sm text-slate-500">
					Zmiany ról i aktywności wymagają sesji administratora oraz tokena CSRF.
				</p>
			</div>
			<div className="divide-y divide-slate-100">
				{users.map((managedUser) => (
					<div key={managedUser.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
						<div>
							<p className="font-medium">{managedUser.name ?? managedUser.email}</p>
							<p className="text-sm text-slate-500">{managedUser.email}</p>
						</div>
						<div className="flex items-center gap-3">
							<select
								disabled={busy || managedUser.id === currentUser.id}
								value={managedUser.role}
								onChange={(event) => void onRoleChange(managedUser, event.target.value as UserRole)}
								className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm disabled:bg-slate-50"
							>
								<option value="user">Użytkownik</option>
								<option value="moderator">Moderator</option>
								<option value="admin">Administrator</option>
							</select>
							<button
								type="button"
								disabled={busy || managedUser.id === currentUser.id}
								onClick={() => void onActiveToggle(managedUser)}
								className={managedUser.is_active ? "action-danger" : "action-primary"}
							>
								{managedUser.is_active ? "Dezaktywuj" : "Aktywuj"}
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default UsersPanel;
