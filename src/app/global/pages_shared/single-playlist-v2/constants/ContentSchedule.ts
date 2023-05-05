import { ContentSchedule } from '../type/ContentSchedule';

export const CONTENT_SCHEDULE: ContentSchedule[] = [
	{
		scheduleTypeId: 1,
		label: 'Default Play',
		slug: 'default-play',
		icon: 'fas fa-clock'
	},
	{
		scheduleTypeId: 2,
		label: 'Custom Schedule',
		slug: 'custom-schedule',
		icon: 'fas fa-calendar'
	},
	{
		scheduleTypeId: 0,
		label: 'Do Not Play',
		slug: 'do-not-play',
		icon: 'fas fa-ban'
	}
];
