import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { API_CONTENT_V2 } from 'src/app/global/models';
import { IsimagePipe } from 'src/app/global/pipes';
import { environment } from 'src/environments/environment';
import { PlaylistContentControls } from '../../constants/PlaylistContentControls';
import { Subject } from 'rxjs/internal/Subject';
import * as moment from 'moment';

@Component({
	selector: 'app-content',
	templateUrl: './content.component.html',
	styleUrls: ['./content.component.scss'],
	providers: [IsimagePipe]
})
export class ContentComponent implements OnInit {
	@Input() content: API_CONTENT_V2;
	@Input() index: number;
	@Input() controls = true;
	@Input() saving = false;
	@Input() selectable = true;
	@Input() selected = false;
	@Input() enabled_controls = ['fullscreen', 'quick-move', 'swap-content', 'edit', 'remove'];
	@Input() default_width = true;
	@Input() detailed_view_mode = false;
	@Input() move_enabled: Subject<boolean> = new Subject<boolean>();
	@Input() swapping: boolean;
	@Output() control_click: EventEmitter<any> = new EventEmitter();
	@Output() content_selected: EventEmitter<string> = new EventEmitter();
	contentName: string;
	filestackScreenshot = `${environment.third_party.filestack_screenshot}`;
	playlistContentControls = PlaylistContentControls;

	constructor(private _isImage: IsimagePipe) {}

	ngOnInit() {
		this.prepareThumbnails();
		if (this.content) this.content.scheduleStatus = this.getScheduleStatus();

		this.move_enabled.subscribe({
			next: (res) => {
				const moveButton = this.playlistContentControls.find((obj) => obj.action == 'quick-move');
				moveButton.disabled = res;
			}
		});
	}

	/**
	 * Sets the schedule status of a playlist content based on its type
	 * @param data
	 * @returns
	 */
	private getScheduleStatus(): string {
		const data: API_CONTENT_V2 = this.content;
		let result = 'inactive';

		if (!data) return result;

		if (!data.playlistContentsScheduleId) {
			data.scheduleStatus = result; // content is inactive if it does not have a content schedule ID
			return;
		}

		switch (data.type) {
			case 3: // type 3 means the content only plays during the set schedule
				const currentDate = moment(new Date(), 'MM/DD/YYYY hh:mm A');
				const startDate = moment(`${data.from} ${data.playTimeStart}`, 'MM/DD/YYYY hh:mm A');
				const endDate = moment(`${data.to} ${data.playTimeEnd}`, 'MM/DD/YYYY hh:mm A');

				if (currentDate.isBefore(startDate)) result = 'future';
				if (currentDate.isBetween(startDate, endDate, undefined)) result = 'active';
				break;

			case 2: // type 2 means the content is set to not play
				result = 'inactive';
				break;

			default: // type 1 means the content is set to always play
				result = 'active';
				break;
		}

		return result;
	}

	private prepareThumbnails() {
		if (!this.content) return;

		/** webm assets  */
		if (this.content.fileType === 'webm')
			this.content.thumbnail = `${this.content.url}${this.content.fileName.substring(0, this.content.fileName.lastIndexOf('.') + 1)}jpg`;

		/** mp4 assets */
		if (this.content.fileType === 'mp4' && this.content.handlerId)
			this.content.thumbnail = `${this.content.url}${this.content.fileName.substring(0, this.content.fileName.lastIndexOf('.') + 1)}jpg`;

		/** image assets */
		if (this._isImage.transform(this.content.fileType)) this.content.thumbnail = `${this.content.url}${this.content.fileName}`;
	}
}
