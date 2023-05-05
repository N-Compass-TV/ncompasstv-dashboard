import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
	selector: 'app-content-settings',
	templateUrl: './content-settings.component.html',
	styleUrls: ['./content-settings.component.scss']
})
export class ContentSettingsComponent implements OnInit {
	durationForm: FormGroup = this._formBuilder.group({
		duration: ['']
	});

	constructor(private _formBuilder: FormBuilder, @Inject(MAT_DIALOG_DATA) public content: any) {}

	ngOnInit() {}
}
