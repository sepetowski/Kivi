import { notFound } from 'next/navigation';

export const getCommunity = async (community_name: string, userId: string) => {
	const res = await fetch(
		`https://kivi-app.vercel.app/api/communities/community/${community_name}?userId=${userId}`,
		{
			method: 'GET',

			cache: 'no-store',
		}
	);

	if (!res.ok) {
		return notFound();
	}

	return res.json();
};
