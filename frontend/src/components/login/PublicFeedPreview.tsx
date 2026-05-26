import type { Post } from "../../types";
import PostCard from "../PostCard";

interface PublicFeedPreviewProps {
	posts: Post[];
	loading: boolean;
}

function PublicFeedPreview({ posts, loading }: PublicFeedPreviewProps) {
	return (
		<section>
			<div className="mb-6 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Public feed</p>
				<h2 className="mt-2 text-xl font-semibold">Opublikowane posty</h2>
			</div>
			{loading && (
				<p className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">Ładowanie postów...</p>
			)}
			{!loading && posts.length === 0 && (
				<p className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
					Brak publicznych wpisów.
				</p>
			)}
			<div className="space-y-5">
				{posts.slice(0, 1).map((post) => (
					<PostCard key={post.id} post={post} />
				))}
			</div>
		</section>
	);
}

export default PublicFeedPreview;
