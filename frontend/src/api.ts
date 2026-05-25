import type { Post, PostModerationStatus, PostPayload, User, UserRole } from "./types";

export const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000";

export class ApiError extends Error {
	status: number;

	constructor(message: string, status: number) {
		super(message);
		this.name = "ApiError";
		this.status = status;
	}
}

let csrfToken: string | null = null;

async function request<T>(path: string, options: RequestInit & { csrf?: boolean } = {}): Promise<T> {
	const { csrf = false, headers: suppliedHeaders, ...requestOptions } = options;
	const headers = new Headers(suppliedHeaders);

	if (requestOptions.body && !headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json");
	}

	if (csrf) {
		const token = await getCsrfToken();
		headers.set("X-CSRF-Token", token);
	}

	const response = await fetch(`${API_URL}${path}`, {
		...requestOptions,
		headers,
		credentials: "include",
	});

	if (!response.ok) {
		let message = "Nie udało się wykonać operacji.";
		try {
			const error = (await response.json()) as { detail?: string };
			message = error.detail ?? message;
		} catch {
			// Preserve the fallback message for non-JSON errors.
		}
		throw new ApiError(message, response.status);
	}

	if (response.status === 204) {
		return undefined as T;
	}

	return (await response.json()) as T;
}

export function beginGoogleLogin(): void {
	window.location.assign(`${API_URL}/auth/google/login`);
}

export function getCurrentUser(): Promise<User> {
	return request<User>("/users/me");
}

export async function getCsrfToken(): Promise<string> {
	if (csrfToken) {
		return csrfToken;
	}

	const response = await request<{ csrf_token: string }>("/auth/csrf");
	csrfToken = response.csrf_token;
	return csrfToken;
}

export async function logout(): Promise<void> {
	await request<void>("/auth/logout", { method: "POST", csrf: true });
	csrfToken = null;
}

export function listPosts(): Promise<Post[]> {
	return request<Post[]>("/posts");
}

export function listMyPosts(): Promise<Post[]> {
	return request<Post[]>("/posts/mine");
}

export function createPost(payload: PostPayload): Promise<Post> {
	return request<Post>("/posts", {
		method: "POST",
		csrf: true,
		body: JSON.stringify(payload),
	});
}

export function updatePost(postId: number, payload: PostPayload): Promise<Post> {
	return request<Post>(`/posts/${postId}`, {
		method: "PATCH",
		csrf: true,
		body: JSON.stringify(payload),
	});
}

export function publishPost(postId: number): Promise<Post> {
	return request<Post>(`/posts/${postId}/publish`, {
		method: "POST",
		csrf: true,
	});
}

export function unpublishPost(postId: number): Promise<Post> {
	return request<Post>(`/posts/${postId}/unpublish`, {
		method: "POST",
		csrf: true,
	});
}

export function deletePost(postId: number): Promise<void> {
	return request<void>(`/posts/${postId}`, {
		method: "DELETE",
		csrf: true,
	});
}

export function listModerationPosts(): Promise<Post[]> {
	return request<Post[]>("/posts/moderation");
}

export function moderatePost(
	postId: number,
	moderationStatus: PostModerationStatus,
	moderationReason: string | null,
): Promise<Post> {
	return request<Post>(`/posts/${postId}/moderation`, {
		method: "PATCH",
		csrf: true,
		body: JSON.stringify({
			moderation_status: moderationStatus,
			moderation_reason: moderationReason,
		}),
	});
}

export function listUsers(): Promise<User[]> {
	return request<User[]>("/admin/users");
}

export function changeUserRole(userId: number, role: UserRole): Promise<User> {
	return request<User>(`/admin/users/${userId}/role`, {
		method: "PATCH",
		csrf: true,
		body: JSON.stringify({ role }),
	});
}

export function changeUserActiveState(userId: number, isActive: boolean): Promise<User> {
	return request<User>(`/admin/users/${userId}/active`, {
		method: "PATCH",
		csrf: true,
		body: JSON.stringify({ is_active: isActive }),
	});
}
