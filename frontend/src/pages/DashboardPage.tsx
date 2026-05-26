import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardTabs from "../components/dashboard/DashboardTabs";
import PostEditorForm from "../components/dashboard/PostEditorForm";
import PostsPanel from "../components/dashboard/PostsPanel";
import UsersPanel from "../components/dashboard/UsersPanel";
import { useDashboard } from "../hooks/useDashboard";
import type { User } from "../types";

interface DashboardPageProps {
	user: User;
	onLogout: () => void;
}

function DashboardPage({ user, onLogout }: DashboardPageProps) {
	const dashboard = useDashboard(user, onLogout);

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900">
			<DashboardHeader user={user} busy={dashboard.busy} onLogout={dashboard.handleLogout} />

			<main className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[360px_1fr] lg:px-10">
				<aside>
					<PostEditorForm
						form={dashboard.form}
						editing={dashboard.editingPostId !== null}
						busy={dashboard.busy}
						onChange={dashboard.setForm}
						onSubmit={dashboard.submitPost}
						onCancel={dashboard.cancelEdit}
					/>
				</aside>

				<section>
					<DashboardTabs
						activeTab={dashboard.tab}
						isStaff={dashboard.isStaff}
						isAdmin={dashboard.isAdmin}
						onSelect={dashboard.setTab}
					/>

					{dashboard.notice && (
						<p className="mb-5 rounded-2xl bg-emerald-50 px-5 py-4 text-sm text-emerald-700">{dashboard.notice}</p>
					)}
					{dashboard.error && (
						<p className="mb-5 rounded-2xl bg-rose-50 px-5 py-4 text-sm text-rose-700">{dashboard.error}</p>
					)}

					{dashboard.loading && (
						<p className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">Ładowanie danych...</p>
					)}

					{!dashboard.loading && dashboard.tab !== "users" && (
						<PostsPanel
							tab={dashboard.tab}
							posts={dashboard.posts}
							busy={dashboard.busy}
							onEdit={dashboard.beginEdit}
							onPublishToggle={dashboard.togglePublish}
							onRemove={dashboard.removePost}
							onModerate={dashboard.moderate}
						/>
					)}

					{!dashboard.loading && dashboard.tab === "users" && (
						<UsersPanel
							currentUser={user}
							users={dashboard.users}
							busy={dashboard.busy}
							onRoleChange={dashboard.updateRole}
							onActiveToggle={dashboard.toggleActiveState}
						/>
					)}
				</section>
			</main>
		</div>
	);
}

export default DashboardPage;
