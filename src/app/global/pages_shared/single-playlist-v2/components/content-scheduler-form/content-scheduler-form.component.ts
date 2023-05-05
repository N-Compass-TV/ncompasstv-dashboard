import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DAYS } from '../../constants';

@Component({
	selector: 'app-content-scheduler-form',
	templateUrl: './content-scheduler-form.component.html',
	styleUrls: ['./content-scheduler-form.component.scss']
})
export class ContentSchedulerFormComponent implements OnInit {
	days = DAYS;
	schedulerForm: FormGroup = this._form_builder.group({
		startDate: ['', Validators.required],
		endDate: ['', Validators.required],
		days: new FormArray([]),
		playTimeStartData: ['', Validators.required],
		playTimeEndData: ['', Validators.required]
	});

	constructor(private _form_builder: FormBuilder) {}

	ngOnInit() {
		this.schedulerForm.valueChanges.subscribe({
			next: (res) => {
				console.log(res);
			}
		});
	}

	onCheckboxChange(event: any) {
		const days = this.schedulerForm.controls['days'] as FormArray;
		if (event.checked) {
			days.push(new FormControl(event.source.value));
		} else {
			const index = days.controls.findIndex((x) => x.value === event.source.value);
			days.removeAt(index);
		}
	}
}
