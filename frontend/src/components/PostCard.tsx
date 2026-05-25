import type { ReactNode } from "react";
import type { Post } from "../types";

interface PostCardProps {
	post: Post;
	actions?: ReactNode;
}

const visibilityNames = {
	public: "Publiczny",
	authenticated: "Zalogowani",
	private: "Prywatny",
	staff_only: "Zespół",
};

function formatDate(value: string | null): string {
	if (!value) {
		return "Szkic";
	}

	return new Intl.DateTimeFormat("pl-PL", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

function PostCard({ post, actions }: PostCardProps) {
	return (
		<article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
			<div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-900 font-semibold text-white">
						{post.author.picture ? (
							<img
								className="h-full w-full object-cover"
								src={post.author.picture}
								alt=""
							/>
						) : (
							(post.author.name ?? "U").charAt(0).toUpperCase()
						)}
					</div>
					<div>
						<p className="font-semibold text-slate-900">
							{post.author.name ?? "Użytkownik"}
						</p>
						<p className="text-slate-500">{formatDate(post.published_at)}</p>
					</div>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
						{visibilityNames[post.visibility]}
					</span>
					{post.moderation_status === "hidden" && (
						<span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700">
							Ukryty
						</span>
					)}
				</div>
			</div>
			<h3 className="text-xl font-semibold tracking-tight text-slate-950">
				{post.title}
			</h3>
			<p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600">
				{post.content}
			</p>
			{post.moderation_reason && (
				<p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
					Powód moderacji: {post.moderation_reason}
				</p>
			)}
			{actions && (
				<div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
					{actions}
				</div>
			)}
		</article>
	);
}

export default PostCard;
