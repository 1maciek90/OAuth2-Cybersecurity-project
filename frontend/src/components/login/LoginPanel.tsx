import { beginGoogleLogin } from "../../api";

function LoginPanel() {
	return (
		<aside>
			<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Logowanie</p>
				<h2 className="mt-2 text-xl font-semibold">Zaloguj się</h2>
				<p className="mt-4 text-sm leading-6 text-slate-500">
					Zaloguj się przez Google, aby tworzyć posty i zarządzać treściami dostępnymi dla użytkowników.
				</p>
				<button
					type="button"
					onClick={beginGoogleLogin}
					className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-cyan-800"
				>
					Kontynuuj z Google
				</button>
			</div>
		</aside>
	);
}

export default LoginPanel;
