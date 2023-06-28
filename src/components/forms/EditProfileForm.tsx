'use client';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputError } from '@/components/forms/InputError';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useFormik } from 'formik';
import { Loader2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { ProfileEditSchema } from '@/validations/ProfileEditSchema';
import { SheetClose, SheetFooter } from '@/components/ui/sheet';

interface Props {
	username: string;
	profileDescription: string;
}

export const EdditProfileForm = ({ profileDescription, username }: Props) => {
	const { toast } = useToast();
	const router = useRouter();
	const session = useSession();
	const [isSending, setIsSending] = useState(false);
	const formik = useFormik({
		initialValues: {
			username,
			profileDescription,
		},
		validationSchema: ProfileEditSchema,

		onSubmit: async (values, { resetForm }) => {
			setIsSending(true);
			try {
				const res = await fetch('/api/edit-profile', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						username: values.username,
						profileDescription: values.profileDescription,
						orignalUserName: session.data?.user.name,
					}),
				});
				if (!res.ok)
					toast({
						variant: 'destructive',
						title: 'Oh no! Something went wrong.',
						description: res.statusText,
					});
				else {
					if (res.status === 201) signOut();
					toast({
						title: res.statusText,
					});
					if (res.status === 200) router.refresh();
				}
			} catch (err) {
				console.log(err);
			}

			setIsSending(false);
		},
	});

	return (
		<form className='w-full' onSubmit={formik.handleSubmit}>
			<div className='grid gap-4 py-4'>
				<div className='grid w-full  items-center gap-1.5'>
					<Label className='font-bold' htmlFor='username'>
						Username
					</Label>
					<Input
						autoComplete='username'
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						value={formik.values.username}
						type='text'
						id='username'
						placeholder='Username'
					/>
					<InputError error={formik.errors.username} isInputTouched={formik.touched.username} />
				</div>
				<div className='grid w-full  items-center gap-1.5'>
					<Label className='font-bold' htmlFor='Profiledescription'>
						Profile description
					</Label>
					<Input
						autoComplete='profileDescription'
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						value={formik.values.profileDescription}
						type='text'
						id='profileDescription'
						placeholder='Profile description'
					/>
					<InputError
						error={formik.errors.profileDescription}
						isInputTouched={formik.touched.profileDescription}
					/>
				</div>
			</div>
			<SheetFooter>
				<SheetClose asChild>
					<Button type='submit'>Save changes</Button>
				</SheetClose>
			</SheetFooter>
		</form>
	);
};
