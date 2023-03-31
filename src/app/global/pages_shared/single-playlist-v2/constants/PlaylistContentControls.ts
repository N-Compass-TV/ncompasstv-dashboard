export const PlaylistContentControls = [
	{
		label: 'Fullscreen',
		icon: 'fas fa-expand-arrows-alt',
		colorClass: 'text-muted',
		action: 'fullscreen'
	},
	{
		label: 'Swap',
		icon: 'fas fa-exchange-alt',
		colorClass: 'info-text',
		action: 'swap'
	},
	{
		label: 'Edit',
		icon: 'fas fa-cog',
		colorClass: 'text-primary',
		action: 'edit'
	},
	{
		label: 'Delete',
		icon: 'fas fa-trash',
		colorClass: 'text-danger',
		action: 'delete'
	}
];

export const PlaylistContentControlActions = {
	delete: 'delete',
	edit: 'edit',
	fullscreen: 'fullscreen',
	swap: 'swap'
};
