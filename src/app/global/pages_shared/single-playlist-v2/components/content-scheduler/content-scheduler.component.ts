import { Component, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core';
import { CONTENT_SCHEDULE } from '../../constants/ContentSchedule';
import { ButtonGroup } from '../../type/ButtonGroup';
import { SinglePlaylistService } from '../../services/single-playlist.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-content-scheduler',
	templateUrl: './content-scheduler.component.html',
	styleUrls: ['./content-scheduler.component.scss']
})
export class ContentSchedulerComponent implements OnInit, OnDestroy {
	@Output() schedule_type_emitter: EventEmitter<any> = new EventEmitter();

	contentSchedule = CONTENT_SCHEDULE;
	hasExistingSchedule = false;
	selectedContentSchedule: ButtonGroup = this.contentSchedule[0];
	protected _unsubscribe = new Subject<void>();

	constructor(private _playlist: SinglePlaylistService) {}

	ngOnInit() {
		this.subscribeToSchedulerFormData();

		if (this.hasExistingSchedule) console.log('emit existing schedule here'); // emit the schedule
		else this._playlist.schedulerFormUpdated.emit({ type: 1 });
	}

	ngOnDestroy(): void {
		this._unsubscribe.next();
		this._unsubscribe.complete();
	}

	onSelectContentScheduleType(data: ButtonGroup) {
		this.selectedContentSchedule = data;

		// if custom schedule is selected then request form data first
		if (data.value === 3) {
			this._playlist.requestSchedulerFormData.emit();
			return;
		}

		this._playlist.schedulerFormUpdated.emit({ type: data.value });
	}

	private subscribeToSchedulerFormData() {
		this._playlist.receiveSchedulerFormData.pipe(takeUntil(this._unsubscribe)).subscribe((response) => {
			this._playlist.schedulerFormUpdated.emit({ type: 3, ...response });
		});
	}
}
