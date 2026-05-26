import LoginPanel from "../components/login/LoginPanel";
import PublicFeedPreview from "../components/login/PublicFeedPreview";
import { usePublicPosts } from "../hooks/usePublicPosts";

function LoginPage() {
	const { publicPosts, postsLoading } = usePublicPosts();

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900">
			<header className="border-b border-slate-200 bg-white">
				<div className="mx-auto max-w-7xl px-6 py-5 lg:px-10">
					<p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">OAuth2 Access Lab</p>
					<h1 className="mt-1 text-2xl font-semibold tracking-tight">Panel publikacji</h1>
				</div>
			</header>
			<main className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[360px_1fr] lg:px-10">
				<LoginPanel />
				<PublicFeedPreview posts={publicPosts} loading={postsLoading} />
			</main>
		</div>
	);
}

export default LoginPage;
