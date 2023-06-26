export type PlaylistContentUpdate = {
	playlistId: string;
	playlistContentsLicenses: PlaylistContent[];
};

export type PlaylistContent = {
	contentId?: string;
	isFullScreen?: number;
	seq?: number;
	duration?: number;
	playlistContentId?: string;
	licenseIds?: string;
};
