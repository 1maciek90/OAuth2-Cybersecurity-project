export type UserRole = "user" | "moderator" | "admin";

export type PostVisibility = "public" | "authenticated" | "private" | "staff_only";

export type PostModerationStatus = "visible" | "hidden";

export interface PublicUser {
	id: number;
	name: string | null;
	picture: string | null;
}

export interface User {
	id: number;
	email: string;
	name: string | null;
	picture: string | null;
	role: UserRole;
	is_active: boolean;
}

export interface Post {
	id: number;
	title: string;
	content: string;
	visibility: PostVisibility;
	moderation_status: PostModerationStatus;
	moderation_reason: string | null;
	author_id: number;
	author: PublicUser;
	published_at: string | null;
	created_at: string;
	updated_at: string;
}

export interface PostPayload {
	title: string;
	content: string;
	visibility: PostVisibility;
}
