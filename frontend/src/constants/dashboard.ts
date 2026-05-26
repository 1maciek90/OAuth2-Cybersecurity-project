import type { PostPayload, PostVisibility, UserRole } from "../types";

export type DashboardTab = "feed" | "mine" | "moderation" | "users";

export const emptyPost: PostPayload = {
	title: "",
	content: "",
	visibility: "public",
};

export const visibilityOptions: Array<{ value: PostVisibility; label: string }> = [
	{ value: "public", label: "Publiczny - każdy" },
	{ value: "authenticated", label: "Tylko zalogowani" },
	{ value: "private", label: "Tylko ja" },
	{ value: "staff_only", label: "Moderatorzy i administratorzy" },
];

export const roleNames: Record<UserRole, string> = {
	user: "Użytkownik",
	moderator: "Moderator",
	admin: "Administrator",
};
