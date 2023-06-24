import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { API_CONTENT } from 'src/app/global/models';
import { IsvideoPipe } from 'src/app/global/pipes';

@Component({
	selector: 'app-basic-settings',
	templateUrl: './basic-settings.component.html',
	styleUrls: ['./basic-settings.component.scss'],
	providers: [IsvideoPipe]
})
export class BasicSettingsComponent implements OnInit {
	@Input() bulk_setting = false;
	@Input() frequency = true;
	@Input() sequence_setting = true;
	@Input() has_image_and_feed = false;
	@Input() playlist_content: API_CONTENT[] = [];
	@Output() changed: EventEmitter<any> = new EventEmitter();

	basicSettings: FormGroup;

	constructor(private _formBuilder: FormBuilder, private _video: IsvideoPipe) {}

	ngOnInit() {
		this.basicSettings = this._formBuilder.group({
			seq: [
				{
					value: !this.bulk_setting && this.playlist_content[0].seq,
					disabled: this.bulk_setting
				}
			],
			duration: [
				{
					value: (!this.bulk_setting && this.playlist_content[0].duration) || 20,
					disabled: !this.bulk_setting && this._video.transform(this.playlist_content[0].fileType)
				}
			],
			frequency: [(!this.bulk_setting && this.playlist_content[0].frequency) || 0],
			isFullScreen: [(!this.bulk_setting && this.playlist_content[0].isFullScreen) || 0]
		});

		this.changed.emit({ ...this.basicSettings.value, isFullScreen: this.basicSettings.controls['isFullScreen'].value.isFullScreen ? 1 : 0 });

		this.basicSettings.valueChanges.subscribe({
			next: (res) => this.changed.emit({ ...res, isFullScreen: res.isFullScreen ? 1 : 0 })
		});
	}
}

// 1. Default to bulk settings where playlist_content will be accepting an array of API_CONTENT
