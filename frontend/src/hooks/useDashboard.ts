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
import { emptyPost, type DashboardTab } from "../constants/dashboard";
import type { Post, PostPayload, User, UserRole } from "../types";

function getErrorMessage(error: unknown): string {
	if (error instanceof ApiError) {
		return error.message;
	}
	return "Nie udało się połączyć z backendem.";
}

export function useDashboard(user: User, onLogout: () => void) {
	const [tab, setTab] = useState<DashboardTab>("feed");
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
				const response =
					tab === "feed"
						? await listPosts()
						: tab === "mine"
							? await listMyPosts()
							: tab === "moderation"
								? await listModerationPosts()
								: await listUsers();

				if (cancelled) {
					return;
				}
				if (tab === "users") {
					setUsers(response as User[]);
				} else {
					setPosts(response as Post[]);
				}
			} catch (requestError) {
				if (!cancelled) {
					setError(getErrorMessage(requestError));
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		}

		void loadTab();
		return () => {
			cancelled = true;
		};
	}, [revision, tab]);

	function reload(message?: string) {
		if (message) {
			setNotice(message);
		}
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

	async function submitPost(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setBusy(true);
		setError(null);
		setNotice(null);
		try {
			if (editingPostId !== null) {
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

	function cancelEdit() {
		setEditingPostId(null);
		setForm(emptyPost);
	}

	function togglePublish(post: Post) {
		return perform(
			() => (post.published_at ? unpublishPost(post.id) : publishPost(post.id)),
			post.published_at ? "Publikacja została cofnięta." : "Post został opublikowany.",
		);
	}

	function removePost(postId: number) {
		return perform(() => deletePost(postId), "Post został usunięty.");
	}

	async function moderate(post: Post) {
		const hidden = post.moderation_status === "visible";
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

	function updateRole(managedUser: User, role: UserRole) {
		return perform(() => changeUserRole(managedUser.id, role), "Rola użytkownika została zmieniona.");
	}

	function toggleActiveState(managedUser: User) {
		return perform(
			() => changeUserActiveState(managedUser.id, !managedUser.is_active),
			"Status konta został zmieniony.",
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

	return {
		tab,
		setTab,
		posts,
		users,
		form,
		setForm,
		editingPostId,
		loading,
		busy,
		error,
		notice,
		isStaff,
		isAdmin,
		submitPost,
		beginEdit,
		cancelEdit,
		togglePublish,
		removePost,
		moderate,
		updateRole,
		toggleActiveState,
		handleLogout,
	};
}
