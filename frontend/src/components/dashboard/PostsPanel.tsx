import type { DashboardTab } from "../../constants/dashboard";
import type { Post } from "../../types";
import PostCard from "../PostCard";

interface PostsPanelProps {
	tab: DashboardTab;
	posts: Post[];
	busy: boolean;
	onEdit: (post: Post) => void;
	onPublishToggle: (post: Post) => Promise<void>;
	onRemove: (postId: number) => Promise<void>;
	onModerate: (post: Post) => Promise<void>;
}

function PostsPanel({ tab, posts, busy, onEdit, onPublishToggle, onRemove, onModerate }: PostsPanelProps) {
	if (posts.length === 0) {
		return (
			<p className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
				Nie ma jeszcze postów w tym widoku.
			</p>
		);
	}

	return (
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
									onClick={() => void onPublishToggle(post)}
									className="action-primary"
								>
									{post.published_at ? "Cofnij publikację" : "Publikuj"}
								</button>
								<button type="button" onClick={() => onEdit(post)} className="action-secondary">
									Edytuj
								</button>
								<button
									type="button"
									disabled={busy}
									onClick={() => void onRemove(post.id)}
									className="action-danger"
								>
									Usuń
								</button>
							</>
						) : tab === "moderation" ? (
							<button
								type="button"
								disabled={busy}
								onClick={() => void onModerate(post)}
								className={post.moderation_status === "visible" ? "action-danger" : "action-primary"}
							>
								{post.moderation_status === "visible" ? "Ukryj post" : "Przywróć post"}
							</button>
						) : undefined
					}
				/>
			))}
		</div>
	);
}

export default PostsPanel;
