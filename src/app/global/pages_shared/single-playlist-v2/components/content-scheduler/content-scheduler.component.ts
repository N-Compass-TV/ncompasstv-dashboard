import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CONTENT_SCHEDULE } from '../../constants/ContentSchedule';
import { ButtonGroup } from '../../type/ButtonGroup';
import { SinglePlaylistService } from '../../services/single-playlist.service';

@Component({
	selector: 'app-content-scheduler',
	templateUrl: './content-scheduler.component.html',
	styleUrls: ['./content-scheduler.component.scss']
})
export class ContentSchedulerComponent implements OnInit {
	@Output() schedule_type_emitter: EventEmitter<any> = new EventEmitter();
	@Input() schedule_id: string;

	contentSchedule = CONTENT_SCHEDULE;
	selectedContentSchedule: ButtonGroup = this.contentSchedule[0];

	constructor(private _playlist: SinglePlaylistService) {}

	ngOnInit() {}

	onSelectContentScheduleType(data: ButtonGroup) {
		this.selectedContentSchedule = data;

		if (data)
			this._playlist.schedulerFormEmitter.emit({
				type: data.value,
				playlistContentsScheduleId: this.schedule_id
			});
	}
}
