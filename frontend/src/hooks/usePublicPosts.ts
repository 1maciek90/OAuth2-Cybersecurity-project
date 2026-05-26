import { useEffect, useState } from "react";
import { listPosts } from "../api";
import type { Post } from "../types";

export function usePublicPosts() {
	const [publicPosts, setPublicPosts] = useState<Post[]>([]);
	const [postsLoading, setPostsLoading] = useState(true);

	useEffect(() => {
		listPosts()
			.then(setPublicPosts)
			.catch(() => setPublicPosts([]))
			.finally(() => setPostsLoading(false));
	}, []);

	return { publicPosts, postsLoading };
}
