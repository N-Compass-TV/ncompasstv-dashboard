import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { API_CONTENT_V2 } from 'src/app/global/models';
import { IsimagePipe } from 'src/app/global/pipes';
import { environment } from 'src/environments/environment';
import { PlaylistContentControls } from '../../constants/PlaylistContentControls';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-content',
	templateUrl: './content.component.html',
	styleUrls: ['./content.component.scss'],
	providers: [IsimagePipe]
})
export class ContentComponent implements OnInit, OnDestroy {
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
	@Output() control_click = new EventEmitter();
	@Output() content_selected = new EventEmitter();
	contentName: string;
	filestackScreenshot = `${environment.third_party.filestack_screenshot}`;
	playlistContentControls = PlaylistContentControls;

	protected _unsubscribe = new Subject<void>();
	constructor(private _isImage: IsimagePipe) {}

	ngOnInit() {
		this.prepareThumbnails();

		this.move_enabled.pipe(takeUntil(this._unsubscribe)).subscribe({
			next: (res) => {
				const moveButton = this.playlistContentControls.find((obj) => obj.action == 'quick-move');
				moveButton.disabled = res;
			}
		});
	}

	ngOnDestroy(): void {
		this._unsubscribe.next();
		this._unsubscribe.complete();
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

	public convertDayFormat(days: number[]) {
		const daysOfWeek = ['S', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
		const convertedDays = [];

		for (const n of days) {
			if (n >= 0 && n <= 6) convertedDays.push(daysOfWeek[n]);
		}

		if (convertedDays[0] == 'S') convertedDays.push(convertedDays.shift());

		return convertedDays.join(', ');
	}
}
