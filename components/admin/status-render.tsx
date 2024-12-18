import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

interface Props {
	status: 'disconnect' | 'playing';
}

export default function StatusRender({ status }: Props) {
	return (
		<Badge
			className={cn('cursor-default', {
				'bg-green-300 text-green-800 hover:bg-green-300': status === 'playing',
				'bg-red-300 text-red-800 hover:bg-red-300': status !== 'playing',
			})}
		>
			{status === 'playing' ? 'Online' : 'Offline'}
		</Badge>
	);
}
