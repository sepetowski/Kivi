import { CommunitiesBrowseCardsContener } from '@/components/communities/CommunitiesBrowseCardsContener';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = {
	title: 'Avaible Communities',
	description: 'Serach for any Community in Kivi app - Social for gamers',
};

const Browse = async () => {
	const session = await getAuthSession();
	if (!session) redirect('/sign-in');
	return <CommunitiesBrowseCardsContener />;
};
export default Browse;
