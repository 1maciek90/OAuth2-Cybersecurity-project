import { useEffect, useState } from "react";
import { beginGoogleLogin, listPosts } from "../api";
import hero from "../assets/hero.png";
import type { Post } from "../types";
import PostCard from "./PostCard";

function LoginPage() {
	const [publicPosts, setPublicPosts] = useState<Post[]>([]);
	const [postsLoading, setPostsLoading] = useState(true);

	useEffect(() => {
		listPosts()
			.then(setPublicPosts)
			.catch(() => setPublicPosts([]))
			.finally(() => setPostsLoading(false));
	}, []);

	return (
		<main className="min-h-screen bg-slate-950 text-white">
			<section className="mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-6 py-10 lg:grid-cols-[1.02fr_0.98fr] lg:px-10">
				<div>
					<div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-200">
						<span className="h-2 w-2 rounded-full bg-cyan-300" />
						OAuth2 Access Lab
					</div>
					<h1 className="max-w-2xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
						Publikuj treści z kontrolą dostępu.
					</h1>
					<p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
						Zaloguj się przez Google, aby tworzyć posty i zobaczyć, jak
						authentication oraz authorization chronią dostęp do informacji.
					</p>
					<button
						type="button"
						onClick={beginGoogleLogin}
						className="mt-10 flex items-center gap-4 rounded-2xl bg-white px-6 py-4 font-semibold text-slate-900 shadow-2xl shadow-cyan-500/10 transition hover:-translate-y-0.5 hover:bg-slate-50"
					>
						<span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xl shadow-sm ring-1 ring-slate-200">
							G
						</span>
						Kontynuuj z Google
					</button>
					<div className="mt-12 grid max-w-xl gap-4 sm:grid-cols-3">
						{["Google OAuth", "Sesja + CSRF", "Role dostępu"].map((item) => (
							<div
								key={item}
								className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300"
							>
								{item}
							</div>
						))}
					</div>
				</div>

				<div className="relative">
					<div className="absolute -inset-10 rounded-full bg-cyan-400/10 blur-3xl" />
					<div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl">
						<img
							className="h-56 w-full rounded-[1.4rem] object-cover object-center opacity-90"
							src={hero}
							alt=""
						/>
						<div className="p-4 sm:p-6">
							<div className="mb-5 flex items-center justify-between">
								<div>
									<p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
										Public feed
									</p>
									<h2 className="mt-1 text-xl font-semibold">
										Opublikowane posty
									</h2>
								</div>
								<span className="rounded-full bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">
									Public
								</span>
							</div>
							{postsLoading && (
								<p className="py-8 text-center text-slate-400">
									Ładowanie postów...
								</p>
							)}
							{!postsLoading && publicPosts.length === 0 && (
								<p className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 text-sm leading-6 text-slate-400">
									Brak publicznych wpisów. Po zalogowaniu możesz opublikować
									pierwszy post.
								</p>
							)}
							{publicPosts.slice(0, 1).map((post) => (
								<div key={post.id} className="text-slate-900">
									<PostCard post={post} />
								</div>
							))}
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}

export default LoginPage;
