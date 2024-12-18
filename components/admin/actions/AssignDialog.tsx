'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { useFirebaseMedia } from '@/hooks/useFirebaseMedia';
import { cn, getYoutubeID } from '@/lib/utils';
import { User, UserMedia } from '@/types';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import YoutubeEmbed from '../light-box/YoutubeEmbed';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import MediaTag from '../media/media-tag';

interface Props {
	user: User | null;
	onClose: () => void;
	onSubmit: (medias: UserMedia[]) => Promise<void>;
	setLightBox: (media: UserMedia) => void;
}

export default function AssignDialog(props: Props) {
	const { media: medias, loading: mediaLoading } = useFirebaseMedia();
	const [mediaSelected, setMediaSelected] = useState<UserMedia[]>([]);
	const [isSubmitting, setSubmitting] = useState(false);
	const [tabActive, setTabActive] = useState<string>('detail');

	const handleSubmit = async () => {
		try {
			setSubmitting(true);
			await props.onSubmit(mediaSelected);
			props.onClose();
		} catch (error) {
			console.log(error);
		} finally {
			setSubmitting(false);
		}
	};

	const handleClickMedia = (media: UserMedia) => {
		if (media.type === 'youtube') {
			if (mediaSelected[0]?.type === 'youtube') {
				return setMediaSelected([]);
			} else {
				return setMediaSelected([media]);
			}
		}

		const newMedia = mediaSelected.filter((item) => item.type !== 'youtube');

		setMediaSelected(
			newMedia.some((item) => item.url === media.url)
				? newMedia.filter((item) => item.url !== media.url)
				: [...newMedia, media]
		);
	};

	useEffect(() => {
		if (props.user && props.user.mediaPlaying) {
			setMediaSelected(props.user.mediaPlaying);
		}
	}, [props.user]);

	return (
		<DialogContent className='md:min-w-[70vw]'>
			<DialogHeader>
				<DialogTitle>
					Assign Media for {props.user?.username ?? 'All user'}
				</DialogTitle>
				<DialogDescription></DialogDescription>
			</DialogHeader>
			<div className='p-1'>
				<Tabs value={tabActive} onValueChange={(value) => setTabActive(value)}>
					<TabsList>
						<TabsTrigger value='detail'>Detail List</TabsTrigger>
						<TabsTrigger value='card'>Card List</TabsTrigger>
					</TabsList>
					<p className='px-1 py-1'>Selected: {mediaSelected?.length ?? 0}</p>
					<TabsContent value='card'>
						<div className='max-h-[80vh] overflow-auto gap-2 grid md:grid-cols-2 lg:grid-cols-3'>
							{mediaLoading && <p>Loading...</p>}
							{!mediaLoading &&
								medias.map((media) => (
									<Card
										key={media.id}
										className={cn(
											'hover:cursor-pointer hover:border-green-400 hover:bg-green-300/20 transition-colors',
											{
												'border-green-400 bg-green-300/20': mediaSelected.some(
													(item) => item.url === media.url
												),
											}
										)}
										onClick={() => handleClickMedia(media)}
									>
										<CardContent className='p-4 w-full '>
											<div className='w-full aspect-video relative overflow-hidden'>
												{media.type === 'image' ? (
													<img
														key={`dialog-${media.id}`}
														src={media.url}
														alt={media.name}
														className='w-full h-full object-cover mb-2 rounded-md'
														onClick={() => props.setLightBox(media)}
													/>
												) : media.type === 'video' ? (
													<video
														key={`dialog-${media.id}`}
														src={media.url}
														className='absolute inset-0 object-cover mb-2'
														onClick={() => props.setLightBox(media)}
													/>
												) : (
													getYoutubeID(media.url) && (
														<YoutubeEmbed
															url={getYoutubeID(media.url)!}
															className='absolute inset-0 object-cover mb-2'
															key={`dialog-${media.id}`}
															autoPlay={false}
															onClick={() => props.setLightBox(media)}
														/>
													)
												)}
											</div>
											<h3 className='font-semibold w-full line-clamp-2'>
												{media.name}
											</h3>
										</CardContent>
									</Card>
								))}
						</div>
					</TabsContent>
					<TabsContent
						value='detail'
						className='max-h-[70vh] overflow-auto'
					>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className='text-center w-[50px]'>#</TableHead>
									<TableHead className='text-center'>Preview</TableHead>
									<TableHead className='text-center'>Name</TableHead>
									<TableHead className='text-center'>Type</TableHead>
									<TableHead className='text-center w-[100px]'>URL</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{medias.map((item, index) => (
									<TableRow
										key={item.id}
										onClick={() => handleClickMedia(item)}
										className={cn('hover:bg-primary/20 cursor-pointer', {
											'bg-primary/20': mediaSelected.some(
												(media) => media.url === item.url
											),
										})}
									>
										<TableCell className='text-center'>{index + 1}</TableCell>
										<TableCell
											className='hover:cursor-pointer size-20'
											onClick={() => props.setLightBox(item)}
										>
											{item.type === 'image' ? (
												<img
													src={item.url}
													alt={item.name}
													className=' size-20 object-cover'
												/>
											) : item.type === 'video' ? (
												<video
													src={item.url}
													className='w-20 h-20 object-cover'
												/>
											) : (
												getYoutubeID(item.url) && (
													<YoutubeEmbed
														autoPlay={false}
														url={getYoutubeID(item.url)!}
														className='w-20 h-20 object-cover'
														onClick={() => {}}
													/>
												)
											)}
										</TableCell>
										<TableCell className='text-ellipsis line-clamp-1 flex items-center h-20'>
											{item.name}
										</TableCell>
										<TableCell className='text-center'>
											<MediaTag tag={item.type} />
										</TableCell>
										<TableCell>
											<a
												href={item.url}
												target='_blank'
												rel='noreferrer'
												className='hover:underline text-sky-500 line-clamp-1 w-[300px]'
											>
												{item.url}
											</a>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TabsContent>
				</Tabs>
			</div>
			<DialogFooter>
				<Button
					variant={'outline'}
					onClick={() => {
						props.onClose();
						setMediaSelected([]);
					}}
				>
					Close
				</Button>
				<Button onClick={handleSubmit} disabled={isSubmitting}>
					{isSubmitting && <Loader2 className='mr-2 size-4 animate-spin' />}
					Update
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}
