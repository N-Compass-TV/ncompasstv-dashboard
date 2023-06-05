export const PlaylistPrimaryControlActions = {
	addContent: 'add-content',
	bulkModify: 'bulk-modify',
	bulkDelete: 'bulk-delete',
	playlistDemo: 'playlist-demo',
	savePlaylist: 'save-playlist',
	viewSchedule: 'view-schedule'
};

export const PlaylistViewOptionActions = {
	detailedView: 'detailed-view',
	gridView: 'grid-view'
};

export const PlaylistFilterActions = {
	contentType: 'content_type',
	contentStatus: 'content_status'
};

export const PlaylistPrimaryControls = [
	{
		label: 'Add Content',
		action: PlaylistPrimaryControlActions.addContent,
		icon: 'fas fa-spinner fa-spin',
		disabled: true
	},
	{
		label: 'Bulk Modify',
		action: PlaylistPrimaryControlActions.bulkModify,
		icon: 'fas fa-cog',
		disabled: true
	},
	{
		label: 'Bulk Delete',
		action: PlaylistPrimaryControlActions.bulkDelete,
		icon: 'fas fa-times text-danger',
		disabled: true
	},
	{
		label: 'View Schedule',
		action: PlaylistPrimaryControlActions.viewSchedule,
		icon: 'fas fa-calendar'
	},
	{
		label: 'Playlist Demo',
		action: PlaylistPrimaryControlActions.playlistDemo,
		icon: 'fas fa-play'
	},
	{
		label: 'Save Changes',
		action: PlaylistPrimaryControlActions.savePlaylist,
		icon: 'fas fa-save'
	}
];

export const PlaylistFiltersDropdown = [
	{
		label: 'Content Type',
		icon: 'fas fa-image',
		action: PlaylistFilterActions.contentType,
		items: [
			{ label: 'All', action: 'all' },
			{ label: 'Feed', action: 'feed' },
			{ label: 'Image', action: 'image' },
			{ label: 'Video', action: 'video' }
		]
	},
	{
		label: 'Content Status',
		action: PlaylistFilterActions.contentStatus,
		icon: 'fas fa-calendar-alt',
		items: [
			{ label: 'All', action: 'all' },
			{ label: 'Active', action: 'active' },
			{ label: 'In Queue', action: 'in-queue' },
			{ label: 'Inactive', action: 'inactive' }
		]
	}
];

export const PlaylistViewOptions = [
	{
		label: 'Detailed View',
		action: PlaylistViewOptionActions.detailedView,
		icon: 'fas fa-info'
	},
	{
		label: 'Grid View',
		action: PlaylistViewOptionActions.gridView,
		icon: 'fas fa-th'
	}
];
