export const PlaylistPrimaryControls = [
	{
		label: 'Add Content',
		action: 'add-content',
		icon: 'fas fa-plus'
	},
	{
		label: 'Bulk Modify',
		action: 'bulk-modify',
		icon: 'fas fa-cog',
		disabled: true
	},
	{
		label: 'Bulk Delete',
		action: 'bulk-delete',
		icon: 'fas fa-times text-danger',
		disabled: true
	},
	{
		label: 'Playlist Demo',
		action: 'playlist-demo',
		icon: 'fas fa-play'
	},
	{
		label: 'Save Changes',
		action: 'save-playlist',
		icon: 'fas fa-save'
	}
];

export const PlaylistPrimaryControlActions = {
	addContent: 'add-content',
	bulkModify: 'bulk-modify',
	bulkDelete: 'bulk-delete',
	playlistDemo: 'playlist-demo',
	savePlaylist: 'save-playlist'
};
