import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
	selector: 'app-content-settings',
	templateUrl: './content-settings.component.html',
	styleUrls: ['./content-settings.component.scss']
})
export class ContentSettingsComponent implements OnInit {
	duration: FormControl = new FormControl(20, [Validators.pattern('^[0-9]*$')]);

	constructor(@Inject(MAT_DIALOG_DATA) public content: any) {}

	ngOnInit() {}
}
