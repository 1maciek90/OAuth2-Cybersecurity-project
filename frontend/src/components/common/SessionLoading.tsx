function SessionLoading() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
			<div className="text-center">
				<div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
				<p>Sprawdzanie bezpiecznej sesji...</p>
			</div>
		</div>
	);
}

export default SessionLoading;
