export interface User {
	id?: string;
	username: string;
	password?: string;
	mediaPlaying?: UserMedia[];
	status: 'playing' | 'disconnect';
	location?: string
}

export type UserMedia = {
	name: string
	type: 'image' | 'video' | 'youtube';
	url: string;
};

export interface Admin {
	id: string;
	username: string;
	password?: string;
}

export interface Media {
	id: string;
	url: string;
	name: string;
	type: 'image' | 'video' | 'youtube';
}
