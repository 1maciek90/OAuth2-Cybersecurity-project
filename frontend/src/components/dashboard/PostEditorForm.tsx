import type { FormEvent } from "react";
import { visibilityOptions } from "../../constants/dashboard";
import type { PostPayload, PostVisibility } from "../../types";

interface PostEditorFormProps {
	form: PostPayload;
	editing: boolean;
	busy: boolean;
	onChange: (value: PostPayload) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
	onCancel: () => void;
}

function PostEditorForm({ form, editing, busy, onChange, onSubmit, onCancel }: PostEditorFormProps) {
	return (
		<form
			onSubmit={(event) => void onSubmit(event)}
			className="sticky top-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
		>
			<p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
				{editing ? "Edycja" : "Nowa publikacja"}
			</p>
			<h2 className="mt-2 text-xl font-semibold">{editing ? "Edytuj post" : "Utwórz szkic"}</h2>
			<label className="mt-6 block text-sm font-medium text-slate-700">
				Tytuł
				<input
					required
					minLength={3}
					maxLength={200}
					value={form.title}
					onChange={(event) => onChange({ ...form, title: event.target.value })}
					className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
					placeholder="Tytuł posta"
				/>
			</label>
			<label className="mt-4 block text-sm font-medium text-slate-700">
				Treść
				<textarea
					required
					maxLength={10000}
					rows={7}
					value={form.content}
					onChange={(event) => onChange({ ...form, content: event.target.value })}
					className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
					placeholder="Co chcesz opublikować?"
				/>
			</label>
			<label className="mt-4 block text-sm font-medium text-slate-700">
				Widoczność
				<select
					value={form.visibility}
					onChange={(event) => onChange({ ...form, visibility: event.target.value as PostVisibility })}
					className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-cyan-600"
				>
					{visibilityOptions.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			</label>
			<button
				disabled={busy}
				className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-cyan-800 disabled:opacity-50"
			>
				{editing ? "Zapisz zmiany" : "Zapisz szkic"}
			</button>
			{editing && (
				<button
					type="button"
					onClick={onCancel}
					className="mt-2 w-full rounded-xl px-5 py-3 text-sm font-medium text-slate-500 hover:bg-slate-50"
				>
					Anuluj edycję
				</button>
			)}
		</form>
	);
}

export default PostEditorForm;
