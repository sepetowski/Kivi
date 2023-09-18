import { NextAuthOptions, getServerSession } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { Adapter } from 'next-auth/adapters';
import { db } from './db';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcrypt';

declare module '@auth/core/types' {
	interface Session {
		error?: 'RefreshAccessTokenError';
	}
}

declare module '@auth/core/jwt' {
	interface JWT {
		access_token: string;
		expires_at: number;
		refresh_token: string;
		error?: 'RefreshAccessTokenError';
	}
}

export const authOptions: NextAuthOptions = {
	session: {
		strategy: 'jwt',
	},
	pages: {
		error: '/sign-in',
		signIn: '/sign-in',
	},
	adapter: PrismaAdapter(db) as Adapter,
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			async profile(profile) {
				return {
					id: profile.sub,
					name: profile.name.toLowerCase(),
					email: profile.email,
					image: profile.picture,
				};
			},
		}),
		GithubProvider({
			clientId: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
			async profile(profile) {
				return {
					id: profile.id,
					name: profile.name.toLowerCase(),
					email: profile.email,
					image: profile.avatar_url,
				};
			},
		}),
		CredentialsProvider({
			name: 'credentials',
			credentials: {
				name: { label: 'Name', type: 'text', placeholder: 'Name' },
				email: { label: 'Email', type: 'text', placeholder: 'Password' },
				password: { label: 'Password', type: 'password', placeholder: 'Password' },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials.password)
					throw new Error('Please enter email and password.');

				const user = await db.user.findUnique({
					where: {
						email: credentials.email,
					},
				});

				if (!user || !user?.hashedPassword)
					throw new Error('User was not found, Please enter valid email.');
				const passwordMatch = await bcrypt.compare(credentials.password, user.hashedPassword);

				if (!passwordMatch)
					throw new Error('The entered password is incorrect, please enter the correct one.');

				return user;
			},
		}),
	],
	secret: process.env.NEXTAUTH_SECRET!,
	debug: process.env.NODE_ENV === 'development',
	callbacks: {
		async jwt({ user, token }) {
			if (user) {
				console.log({ ...token, ...user });
				return { ...token, ...user };
			}
			console.log(token);
			return token;
		},
		async session({ session, token }) {
			if (token) {
				session.user.id = token.sub!;
				session.user.name = token.name?.toLowerCase();
				session.user.email = token.email;
				session.user.image = token.picture;
				session.user.username = token.username?.toLowerCase();
			}
			const user = await db.user.findUnique({
				where: {
					id: token.sub!,
				},
			});
			if (user) {
				session.user.image = user.image;
				session.user.name = user.name?.toLowerCase();
			}

			return session;
		},
	},
};

export const getAuthSession = () => getServerSession(authOptions);
