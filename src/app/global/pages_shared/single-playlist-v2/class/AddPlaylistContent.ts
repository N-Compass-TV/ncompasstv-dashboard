export class AddPlaylistContent {
	playlistId: string;
	playlistContentsLicenses: {
		contentId: string;
		seq: number;
		isFullScreen: number;
		duration: number;
		licenseIds: string[];
	}[];
}
