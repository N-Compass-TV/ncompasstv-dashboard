import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { API_CONTENT } from 'src/app/global/models';

@Component({
	selector: 'app-basic-settings',
	templateUrl: './basic-settings.component.html',
	styleUrls: ['./basic-settings.component.scss']
})
export class BasicSettingsComponent implements OnInit {
	@Input() bulk_setting = false;
	@Input() frequency = true;
	@Input() sequence_setting = true;
	@Input() has_image_and_feed = false;
	@Input() playlist_content: API_CONTENT;
	@Output() changed: EventEmitter<any> = new EventEmitter();

	basicSettings: FormGroup = this._formBuilder.group({
		seq: [''],
		duration: [''],
		frequency: [''],
		isFullScreen: ['']
	});

	constructor(private _formBuilder: FormBuilder) {}

	ngOnInit() {
		this.basicSettings.valueChanges.subscribe({
			next: (res) => this.changed.emit({ ...res, isFullScreen: res.isFullScreen ? 1 : 0 })
		});
	}
}

// 1. Default to bulk settings where playlist_content will be accepting an array of API_CONTENT
