import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { API_CONTENT } from 'src/app/global/models';
import { IsimagePipe } from 'src/app/global/pipes';
import { environment } from 'src/environments/environment';
import { PlaylistContentControls } from '../../constants/PlaylistContentControls';

@Component({
	selector: 'app-content',
	templateUrl: './content.component.html',
	styleUrls: ['./content.component.scss'],
	providers: [IsimagePipe]
})
export class ContentComponent implements OnInit {
	@Input() content: API_CONTENT;
	@Input() index: number;
	@Input() controls = true;
	@Input() enabled_controls = ['fullscreen', 'swap', 'edit', 'remove'];
	@Input() default_width = true;
	@Output() control_click: EventEmitter<any> = new EventEmitter();
	@Output() content_selected: EventEmitter<string> = new EventEmitter();
	contentName: string;
	filestackScreenshot = `${environment.third_party.filestack_screenshot}`;
	playlistContentControls = PlaylistContentControls;

	constructor(private _isImage: IsimagePipe) {}

	ngOnInit() {
		this.prepareThumbnails();
	}

	prepareThumbnails() {
		if (!this.content) return;

		/** webm assets  */
		if (this.content.fileType === 'webm')
			this.content.thumbnail = `${this.content.url}${this.content.fileName.substr(0, this.content.fileName.lastIndexOf('.') + 1)}jpg`;

		/** mp4 assets */
		if (this.content.fileType === 'mp4' && this.content.handlerId)
			this.content.thumbnail = `${this.content.url}${this.content.fileName.substr(0, this.content.fileName.lastIndexOf('.') + 1)}jpg`;

		/** image assets */
		if (this._isImage.transform(this.content.fileType)) this.content.thumbnail = `${this.content.url}${this.content.fileName}`;
	}
}
