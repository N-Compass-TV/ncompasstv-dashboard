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
		label: 'Remove',
		icon: 'fas fa-times',
		colorClass: 'text-danger',
		action: 'remove'
	}
];

export const PlaylistContentControlActions = {
	remove: 'remove',
	edit: 'edit',
	fullscreen: 'fullscreen',
	swap: 'swap'
};
