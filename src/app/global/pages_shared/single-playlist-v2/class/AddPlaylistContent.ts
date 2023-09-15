export class AddPlaylistContent {
	playlistId: string;
	playlistContentsLicenses: {
		contentId: string;
		seq: number;
		isFullScreen: number;
		duration: number;
		licenseIds: string[];
		alternateWeek?: number;
		from?: string;
		to?: string;
		day?: string;
		playTimeStart?: string;
		playTimeEnd?: string;
		type?: number;
		playlistContentShceduleId?: string;
	}[];
}
