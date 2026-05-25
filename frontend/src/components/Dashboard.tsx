import { useEffect, useState, type FormEvent } from "react";
import {
	ApiError,
	changeUserActiveState,
	changeUserRole,
	createPost,
	deletePost,
	getCsrfToken,
	listModerationPosts,
	listMyPosts,
	listPosts,
	listUsers,
	logout,
	moderatePost,
	publishPost,
	unpublishPost,
	updatePost,
} from "../api";
import type { Post, PostPayload, PostVisibility, User, UserRole } from "../types";
import PostCard from "./PostCard";

interface DashboardProps {
	user: User;
	onLogout: () => void;
}

type Tab = "feed" | "mine" | "moderation" | "users";

const emptyPost: PostPayload = {
	title: "",
	content: "",
	visibility: "public",
};

const visibilityOptions: Array<{ value: PostVisibility; label: string }> = [
	{ value: "public", label: "Publiczny - każdy" },
	{ value: "authenticated", label: "Tylko zalogowani" },
	{ value: "private", label: "Tylko ja" },
	{ value: "staff_only", label: "Moderatorzy i administratorzy" },
];

const roleNames: Record<UserRole, string> = {
	user: "Użytkownik",
	moderator: "Moderator",
	admin: "Administrator",
};

function getErrorMessage(error: unknown): string {
	if (error instanceof ApiError) {
		return error.message;
	}
	return "Nie udało się połączyć z backendem.";
}

function Dashboard({ user, onLogout }: DashboardProps) {
	const [tab, setTab] = useState<Tab>("feed");
	const [posts, setPosts] = useState<Post[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [form, setForm] = useState<PostPayload>(emptyPost);
	const [editingPostId, setEditingPostId] = useState<number | null>(null);
	const [loading, setLoading] = useState(true);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const [revision, setRevision] = useState(0);

	const isStaff = user.role === "moderator" || user.role === "admin";
	const isAdmin = user.role === "admin";

	useEffect(() => {
		getCsrfToken().catch((requestError: unknown) => {
			setError(getErrorMessage(requestError));
		});
	}, []);

	useEffect(() => {
		let cancelled = false;

		async function loadTab() {
			setLoading(true);
			setError(null);
			try {
				if (tab === "feed") {
					const response = await listPosts();
					if (!cancelled) setPosts(response);
				}
				if (tab === "mine") {
					const response = await listMyPosts();
					if (!cancelled) setPosts(response);
				}
				if (tab === "moderation") {
					const response = await listModerationPosts();
					if (!cancelled) setPosts(response);
				}
				if (tab === "users") {
					const response = await listUsers();
					if (!cancelled) setUsers(response);
				}
			} catch (requestError) {
				if (!cancelled) setError(getErrorMessage(requestError));
			} finally {
				if (!cancelled) setLoading(false);
			}
		}

		void loadTab();
		return () => {
			cancelled = true;
		};
	}, [revision, tab]);

	function reload(message?: string) {
		if (message) setNotice(message);
		setRevision((value) => value + 1);
	}

	async function perform(action: () => Promise<unknown>, message: string) {
		setBusy(true);
		setError(null);
		setNotice(null);
		try {
			await action();
			reload(message);
		} catch (requestError) {
			setError(getErrorMessage(requestError));
		} finally {
			setBusy(false);
		}
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setBusy(true);
		setError(null);
		setNotice(null);
		try {
			if (editingPostId) {
				await updatePost(editingPostId, form);
				setNotice("Post został zaktualizowany.");
			} else {
				await createPost(form);
				setNotice("Szkic posta został zapisany.");
			}
			setForm(emptyPost);
			setEditingPostId(null);
			setTab("mine");
			setRevision((value) => value + 1);
		} catch (requestError) {
			setError(getErrorMessage(requestError));
		} finally {
			setBusy(false);
		}
	}

	function beginEdit(post: Post) {
		setEditingPostId(post.id);
		setForm({
			title: post.title,
			content: post.content,
			visibility: post.visibility,
		});
		window.scrollTo({ top: 0, behavior: "smooth" });
	}

	async function handleModeration(post: Post, hidden: boolean) {
		let reason: string | null = null;
		if (hidden) {
			reason = window.prompt("Podaj powód ukrycia posta:")?.trim() ?? "";
			if (!reason) {
				return;
			}
		}
		await perform(
			() => moderatePost(post.id, hidden ? "hidden" : "visible", reason),
			hidden ? "Post został ukryty." : "Post został przywrócony.",
		);
	}

	async function handleLogout() {
		setBusy(true);
		try {
			await logout();
			onLogout();
		} catch (requestError) {
			setError(getErrorMessage(requestError));
			setBusy(false);
		}
	}

	const tabs: Array<{ key: Tab; label: string; visible: boolean }> = [
		{ key: "feed", label: "Feed", visible: true },
		{ key: "mine", label: "Moje posty", visible: true },
		{ key: "moderation", label: "Moderacja", visible: isStaff },
		{ key: "users", label: "Użytkownicy", visible: isAdmin },
	];

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900">
			<header className="border-b border-slate-200 bg-white">
				<div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-6 py-5 lg:px-10">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">OAuth2 Access Lab</p>
						<h1 className="mt-1 text-2xl font-semibold tracking-tight">Dashboard publikacji</h1>
					</div>
					<div className="flex items-center gap-4">
						<div className="hidden text-right sm:block">
							<p className="font-medium">{user.name ?? user.email}</p>
							<p className="text-sm text-slate-500">{roleNames[user.role]}</p>
						</div>
						{user.picture ? (
							<img className="h-11 w-11 rounded-full border border-slate-200" src={user.picture} alt="" />
						) : (
							<div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 font-semibold text-white">
								{(user.name ?? user.email).charAt(0).toUpperCase()}
							</div>
						)}
						<button
							type="button"
							disabled={busy}
							onClick={() => void handleLogout()}
							className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium transition hover:border-slate-400 disabled:opacity-50">
							Wyloguj
						</button>
					</div>
				</div>
			</header>

			<main className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[360px_1fr] lg:px-10">
				<aside>
					<form
						onSubmit={(event) => void handleSubmit(event)}
						className="sticky top-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
							{editingPostId ? "Edycja" : "Nowa publikacja"}
						</p>
						<h2 className="mt-2 text-xl font-semibold">{editingPostId ? "Edytuj post" : "Utwórz szkic"}</h2>
						<label className="mt-6 block text-sm font-medium text-slate-700">
							Tytuł
							<input
								required
								minLength={3}
								maxLength={200}
								value={form.title}
								onChange={(event) => setForm({ ...form, title: event.target.value })}
								className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
								placeholder="Tytuł posta"
							/>
						</label>
						<label className="mt-4 block text-sm font-medium text-slate-700">
							Treść
							<textarea
								required
								maxLength={10000}
								rows={7}
								value={form.content}
								onChange={(event) => setForm({ ...form, content: event.target.value })}
								className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
								placeholder="Co chcesz opublikować?"
							/>
						</label>
						<label className="mt-4 block text-sm font-medium text-slate-700">
							Widoczność
							<select
								value={form.visibility}
								onChange={(event) =>
									setForm({
										...form,
										visibility: event.target.value as PostVisibility,
									})
								}
								className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-cyan-600">
								{visibilityOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</label>
						<button
							disabled={busy}
							className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-cyan-800 disabled:opacity-50">
							{editingPostId ? "Zapisz zmiany" : "Zapisz szkic"}
						</button>
						{editingPostId && (
							<button
								type="button"
								onClick={() => {
									setEditingPostId(null);
									setForm(emptyPost);
								}}
								className="mt-2 w-full rounded-xl px-5 py-3 text-sm font-medium text-slate-500 hover:bg-slate-50">
								Anuluj edycję
							</button>
						)}
					</form>
				</aside>

				<section>
					<nav className="mb-6 flex flex-wrap gap-2">
						{tabs
							.filter((item) => item.visible)
							.map((item) => (
								<button
									key={item.key}
									type="button"
									onClick={() => setTab(item.key)}
									className={`rounded-xl px-5 py-3 text-sm font-medium transition ${
										tab === item.key
											? "bg-slate-950 text-white"
											: "border border-slate-200 bg-white text-slate-600 hover:border-slate-400"
									}`}>
									{item.label}
								</button>
							))}
					</nav>

					{notice && <p className="mb-5 rounded-2xl bg-emerald-50 px-5 py-4 text-sm text-emerald-700">{notice}</p>}
					{error && <p className="mb-5 rounded-2xl bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</p>}

					{loading && (
						<p className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">Ładowanie danych...</p>
					)}

					{!loading && tab !== "users" && posts.length === 0 && (
						<p className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
							Nie ma jeszcze postów w tym widoku.
						</p>
					)}

					{!loading && tab !== "users" && (
						<div className="space-y-5">
							{posts.map((post) => (
								<PostCard
									key={post.id}
									post={post}
									actions={
										tab === "mine" ? (
											<>
												<button
													type="button"
													disabled={busy}
													onClick={() =>
														void perform(
															() => (post.published_at ? unpublishPost(post.id) : publishPost(post.id)),
															post.published_at ? "Publikacja została cofnięta." : "Post został opublikowany.",
														)
													}
													className="action-primary">
													{post.published_at ? "Cofnij publikację" : "Publikuj"}
												</button>
												<button type="button" onClick={() => beginEdit(post)} className="action-secondary">
													Edytuj
												</button>
												<button
													type="button"
													disabled={busy}
													onClick={() => void perform(() => deletePost(post.id), "Post został usunięty.")}
													className="action-danger">
													Usuń
												</button>
											</>
										) : tab === "moderation" ? (
											<button
												type="button"
												disabled={busy}
												onClick={() => void handleModeration(post, post.moderation_status === "visible")}
												className={post.moderation_status === "visible" ? "action-danger" : "action-primary"}>
												{post.moderation_status === "visible" ? "Ukryj post" : "Przywróć post"}
											</button>
										) : undefined
									}
								/>
							))}
						</div>
					)}

					{!loading && tab === "users" && (
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
												disabled={busy || managedUser.id === user.id}
												value={managedUser.role}
												onChange={(event) =>
													void perform(
														() => changeUserRole(managedUser.id, event.target.value as UserRole),
														"Rola użytkownika została zmieniona.",
													)
												}
												className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm disabled:bg-slate-50">
												<option value="user">Użytkownik</option>
												<option value="moderator">Moderator</option>
												<option value="admin">Administrator</option>
											</select>
											<button
												type="button"
												disabled={busy || managedUser.id === user.id}
												onClick={() =>
													void perform(
														() => changeUserActiveState(managedUser.id, !managedUser.is_active),
														"Status konta został zmieniony.",
													)
												}
												className={managedUser.is_active ? "action-danger" : "action-primary"}>
												{managedUser.is_active ? "Dezaktywuj" : "Aktywuj"}
											</button>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</section>
			</main>
		</div>
	);
}

export default Dashboard;
