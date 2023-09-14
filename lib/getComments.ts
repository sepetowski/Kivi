

export const getComments = async (post_id: string) => {
	const res = await fetch(`https://kivi-app.vercel.app/api/comments/get?postId=${post_id}`, {
		method: 'GET',
		cache: 'no-store',
	});

	if (!res.ok) {
		return [];
	}

	return res.json();
};
