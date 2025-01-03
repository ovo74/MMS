'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFirebaseUsers } from '@/hooks/useFirebaseUsers';
import { userSchema } from '@/lib/schemas';
import { Button, buttonVariants } from '@/components/ui/button';
import Marquee from 'react-fast-marquee';
import { Input } from '@/components/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';

import PasswordColumn from '@/components/admin/PasswordColumn';
import { Loader2, Pencil, Plus, Trash } from 'lucide-react';
import { z } from 'zod';
import { PasswordInput } from '@/components/ui/password-input';
import toast from 'react-hot-toast';
import StatusRender from '@/components/admin/status-render';

type UserFormData = z.infer<typeof userSchema>;

export default function UserManagement() {
	const { users, loading, addUser, updateUser, deleteUser } =
		useFirebaseUsers();
	const [isAddUserOpen, setIsAddUserOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<Partial<UserFormData> | null>(
		null
	);
	const [deletingUser, setDeletingUser] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<UserFormData>({
		resolver: zodResolver(userSchema),
		defaultValues: {
			username: '',
			password: '',
		},
	});

	if (loading) return <div>Loading...</div>;
	// if (error) return <div>Error: {error}</div>;

	const onSubmit = async (data: UserFormData) => {
		setIsSubmitting(true);
		try {
			if (editingUser) {
				await updateUser(editingUser.id!, data);
				setEditingUser(null);
			} else {
				const res = await addUser({
					username: data.username,
					password: data.password,
					location: data.location??' '
				});
				if (!res) {
					throw new Error();
				}

				setIsAddUserOpen(false);
				form.reset();
			}
			toast.success(`${editingUser ? 'Update' : 'Create'} user sucessfull !`);
		} catch (error) {
			console.error(error);
			toast.error(`Failed to ${editingUser ? 'Update' : 'Create'} user`);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEdit = (user: Partial<UserFormData>) => {
		setEditingUser(user);
		form.reset(user);
	};

	const confirmDelete = async () => {
		if (deletingUser) {
			try {
				await deleteUser(deletingUser);
				setDeletingUser(null);
				toast.success('Delete Successful!');
			} catch (error) {
				console.log(error);
				toast.error('Delete Error!');
			}
		}
	};

	return (
		<div className='space-y-4'>
			<h1 className='text-2xl font-bold'>User Management</h1>

			<Dialog
				open={isAddUserOpen || !!editingUser}
				onOpenChange={(open) => {
					setIsAddUserOpen(open);
					if (!open) setEditingUser(null);
				}}
			>
				<div className='flex justify-end'>
					<DialogTrigger asChild>
						<Button
							onClick={() => {
								toast.success('Fill new user information');
							}}
						>
							<Plus className='size-4' />
							Add User
						</Button>
					</DialogTrigger>
				</div>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{editingUser ? 'Edit User' : 'Add New User'}
						</DialogTitle>
					</DialogHeader>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
							<FormField
								control={form.control}
								name='username'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Username</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='location'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Location</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='password'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<PasswordInput {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</form>
					</Form>
					<DialogFooter>
						<Button
							type='submit'
							onClick={form.handleSubmit(onSubmit)}
							disabled={isSubmitting}
						>
							{isSubmitting && (
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							)}
							{editingUser ? 'Update User' : 'Add User'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog
				open={!!deletingUser}
				onOpenChange={(open) => !open && setDeletingUser(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Are you sure you want to delete this user?
						</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							user account.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDelete}
							className={buttonVariants({ variant: 'destructive' })}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className='w-[50px] text-center'>#</TableHead>
						<TableHead className='text-center'>Username</TableHead>
						<TableHead className='text-center'>Status</TableHead>
						<TableHead className='text-center'>Media Playing</TableHead>
						<TableHead className='text-center'>Location</TableHead>
						<TableHead className='text-center'>Password</TableHead>
						<TableHead className='w-[100px] text-center'>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{users.map((user, index) => (
						<TableRow key={user.id}>
							<TableCell className='text-center'>{index + 1}</TableCell>
							<TableCell className='text-center'>{user.username}</TableCell>
							<TableCell className='text-center'>
								<StatusRender status={user.status} />
							</TableCell>
							<TableCell className='text-center w-[200px]'>
								{user.mediaPlaying && user.mediaPlaying.length > 0 && (
									<Marquee>{user.mediaPlaying.map(media => media.name).join(', ')}</Marquee>
								)}
							</TableCell>
							<TableCell className='text-center'>
								{user.location ?? ''}
							</TableCell>
							<TableCell className='flex justify-center items-center'>
								<PasswordColumn text={user.password!} />
							</TableCell>
							<TableCell>
								<div className='flex space-x-2'>
									<Button
										variant='ghost'
										size='icon'
										onClick={() => handleEdit(user)}
									>
										<Pencil className='size -4' />
									</Button>
									<Button
										variant='ghost'
										size='icon'
										onClick={() => setDeletingUser(user.id!)}
									>
										<Trash className='size -4' />
									</Button>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
