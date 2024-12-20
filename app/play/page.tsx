'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import MediaList from '@/components/play/MediaList';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function DashboardPage() {
	const { user, isAdmin } = useAuthStore();

	useEffect(() => {
		if (!user || isAdmin) {
			redirect('/');
		}
	}, [user, isAdmin]);

	// Khi người dùng đóng tab hoặc tắt trình duyệt
	useEffect(() => {
		if (!user) return;
		const onCloseTab = async () => {
			await updateDoc(doc(db, 'users', user.id!), {
				status: 'disconnect',
			});
		};
		
		const elem = document.documentElement;
		if (elem) elem?.requestFullscreen();
		window.addEventListener('beforeunload', onCloseTab);

		return () => window.removeEventListener('beforeunload', onCloseTab);
	}, []);

	if (!user || isAdmin) return null;

	return <MediaList />;
}
