import { Component, EventEmitter, OnInit } from '@angular/core';
import { CONTENT_SCHEDULE } from '../../constants/ContentSchedule';
import { ContentSchedule } from '../../type/ContentSchedule';

@Component({
	selector: 'app-content-scheduler',
	templateUrl: './content-scheduler.component.html',
	styleUrls: ['./content-scheduler.component.scss']
})
export class ContentSchedulerComponent implements OnInit {
	content_schedule: EventEmitter<any> = new EventEmitter();
	contentSchedule = CONTENT_SCHEDULE;
	selectedContentSchedule: ContentSchedule = this.contentSchedule[0];

	constructor() {}

	ngOnInit() {}
}
