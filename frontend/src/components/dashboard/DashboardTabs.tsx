import type { DashboardTab } from "../../constants/dashboard";

interface DashboardTabsProps {
	activeTab: DashboardTab;
	isStaff: boolean;
	isAdmin: boolean;
	onSelect: (tab: DashboardTab) => void;
}

const tabs: Array<{ key: DashboardTab; label: string; staff?: boolean; admin?: boolean }> = [
	{ key: "feed", label: "Feed" },
	{ key: "mine", label: "Moje posty" },
	{ key: "moderation", label: "Moderacja", staff: true },
	{ key: "users", label: "Użytkownicy", admin: true },
];

function DashboardTabs({ activeTab, isStaff, isAdmin, onSelect }: DashboardTabsProps) {
	return (
		<nav className="mb-6 flex flex-wrap gap-2">
			{tabs
				.filter((item) => (!item.staff || isStaff) && (!item.admin || isAdmin))
				.map((item) => (
					<button
						key={item.key}
						type="button"
						onClick={() => onSelect(item.key)}
						className={`rounded-xl px-5 py-3 text-sm font-medium transition ${
							activeTab === item.key
								? "bg-slate-950 text-white"
								: "border border-slate-200 bg-white text-slate-600 hover:border-slate-400"
						}`}
					>
						{item.label}
					</button>
				))}
		</nav>
	);
}

export default DashboardTabs;
