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
		label: 'View Schedule',
		action: 'view-schedule',
		icon: 'fas fa-calendar'
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

export const PlaylistFiltersDropdown = [
	{
		label: 'Content Type',
		icon: 'fas fa-image',
		action: 'content-type',
		items: [
			{ label: 'All', action: 'all' },
			{ label: 'Feed', action: 'feed' },
			{ label: 'Image', action: 'image' },
			{ label: 'Video', action: 'video' }
		]
	},
	{
		label: 'Content Status',
		action: 'content-status',
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
		label: 'List View',
		action: 'list-view',
		icon: 'fas fa-list'
	},
	{
		label: 'Grid View',
		action: 'grid-view',
		icon: 'fas fa-th'
	}
];

export const PlaylistPrimaryControlActions = {
	addContent: 'add-content',
	bulkModify: 'bulk-modify',
	bulkDelete: 'bulk-delete',
	playlistDemo: 'playlist-demo',
	savePlaylist: 'save-playlist'
};
