import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material';
import { API_CONTENT, API_HOST, API_LICENSE } from 'src/app/global/models';

@Component({
	selector: 'app-add-content',
	templateUrl: './add-content.component.html',
	styleUrls: ['./add-content.component.scss']
})
export class AddContentComponent implements OnInit {
	assets: API_CONTENT[] = [];
	durationForm: FormGroup = this._formBuilder.group({
		duration: ['']
	});
	gridCount = 8;
	playlistHostLicenses: { host: API_HOST; licenses: API_LICENSE[] }[] = [];
	selectedContents: API_CONTENT[] = [];
	selectedContentForSettings: API_CONTENT;

	constructor(
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public _dialog_data: { assets: API_CONTENT[]; hostLicenses: { host: API_HOST; licenses: API_LICENSE[] }[] }
	) {
		this.assets = [...this._dialog_data.assets];
		this.playlistHostLicenses = this._dialog_data.hostLicenses ? [...this._dialog_data.hostLicenses] : [];
	}

	ngOnInit() {}

	public contentSelected(content: API_CONTENT) {
		if (this.selectedContents.includes(content)) this.selectedContents = this.selectedContents.filter((p) => p !== content);
		else this.selectedContents.push(content);
	}

	public contentSelectedForSettings(content: API_CONTENT) {}
}
