export interface NewPlaylistContent {
	playlist: {
		playlistId: string;
	};
	playlistContentsLicenses: {
		contentId: string;
		seq: number;
		isFullscreen: number;
		duration: number;
		licenseIds: string[];
	}[];
}
