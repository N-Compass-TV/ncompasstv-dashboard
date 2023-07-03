import { ButtonGroup } from '../type/ButtonGroup';

export const CONTENT_SCHEDULE: ButtonGroup[] = [
	{
		value: 1,
		label: 'Default Play',
		slug: 'default-play',
		icon: 'fas fa-clock'
	},
	{
		value: 2,
		label: 'Custom Schedule',
		slug: 'custom-schedule',
		icon: 'fas fa-calendar'
	},
	{
		value: 0,
		label: 'Do Not Play',
		slug: 'do-not-play',
		icon: 'fas fa-ban'
	}
];
