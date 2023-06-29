export type PlaylistContentUpdate = {
	playlistId: string;
	playlistContentsLicenses: PlaylistContent[];
};

export type PlaylistContent = {
	contentId?: string;
	duration?: number;
	isFullScreen?: number;
	licenseIds?: string;
	playlistContentId?: string;
	seq?: number;
};
