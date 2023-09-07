import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DAYS } from '../../constants';
import { SinglePlaylistService } from '../../services/single-playlist.service';
import * as moment from 'moment';
import { MatCheckboxChange } from '@angular/material';

@Component({
	selector: 'app-content-scheduler-form',
	templateUrl: './content-scheduler-form.component.html',
	styleUrls: ['./content-scheduler-form.component.scss']
})
export class ContentSchedulerFormComponent implements OnInit, OnDestroy {
	alternateWeek = 0;
	days = DAYS;
	hasAlternateWeekSet = false;
	hasCheckedAllDays = true;
	isCheckedToPlayAllDay = true;

	schedulerForm: FormGroup = this._form_builder.group({
		alternateWeek: [0],
		startDate: ['', Validators.required],
		endDate: ['', Validators.required],
		days: ['', Validators.required],
		playTimeStartData: ['', Validators.required],
		playTimeEndData: ['', Validators.required],
		type: [3, Validators.required]
	});

	protected _unsubscribe = new Subject<void>();

	constructor(private _form_builder: FormBuilder, private _playlist: SinglePlaylistService) {}

	ngOnInit() {
		this.subscribeToGetFormData();
		this.subscribeToFormChanges();
		this.setDefaultFormValues();
	}

	ngOnDestroy(): void {
		this._unsubscribe.next();
		this._unsubscribe.complete();
	}

	onCheckboxChange(event: MatCheckboxChange) {
		const dayChanged = event.source.value as any;
		let currentDaysValue = this.schedulerForm.get('days').value as { dayId: number; day: string; checked: boolean }[];

		currentDaysValue = currentDaysValue.map((day) => {
			if (dayChanged.dayId === day.dayId) day.checked = event.checked;
			return day;
		});

		this.hasCheckedAllDays = currentDaysValue.filter((day) => day.checked).length === 7;

		this.schedulerForm.get('days').setValue(currentDaysValue);
	}

	onSelectAllDays() {
		this.hasCheckedAllDays = !this.hasCheckedAllDays;
		const daysCtrl = this.schedulerForm.get('days');
		const currentDaysValue = daysCtrl.value as { dayId: number; day: string; checked: boolean }[];
		let result: { dayId: number; day: string; checked: boolean }[] = [];

		result = currentDaysValue.map((day) => {
			day.checked = this.hasCheckedAllDays;
			return day;
		});

		daysCtrl.patchValue(result);
	}

	onSelectToPlayAllDay(event: MatCheckboxChange) {
		const form = this.schedulerForm;
		this.isCheckedToPlayAllDay = !this.isCheckedToPlayAllDay;
		const startTimeCtrl = form.get('playTimeStartData');
		const endTimeCtrl = form.get('playTimeEndData');

		if (event.checked) {
			startTimeCtrl.setValue({ hour: 0, minute: 0, second: 0 });
			endTimeCtrl.setValue({ hour: 23, minute: 59, second: 59 });
			return;
		}

		startTimeCtrl.setValue({ hour: 8, minute: 0, second: 0 });
		endTimeCtrl.setValue({ hour: 17, minute: 0, second: 59 });
	}

	selectAlternatingWeek() {
		const alternateWeekControl = this.schedulerForm.get('alternateWeek');
		this.hasAlternateWeekSet = !this.hasAlternateWeekSet;
		this.alternateWeek = this.hasAlternateWeekSet ? 1 : 0;
		alternateWeekControl.setValue(this.alternateWeek);
	}

	private subscribeToFormChanges() {
		const form = this.schedulerForm;

		form.valueChanges.pipe(takeUntil(this._unsubscribe), debounceTime(1000)).subscribe({
			next: () => {
				this._playlist.schedulerFormUpdated.emit(form.value);
			}
		});
	}

	private subscribeToGetFormData() {
		this._playlist.requestSchedulerFormData.pipe(takeUntil(this._unsubscribe)).subscribe(() => {
			const form = this.schedulerForm;
			this._playlist.receiveSchedulerFormData.emit(form.value);
		});
	}

	private setDefaultFormValues() {
		const form = this.schedulerForm;
		const startDateCtrl = form.get('startDate');
		const endDateCtrl = form.get('endDate');
		const daysCtrl = form.get('days') as FormArray;
		const startTimeCtrl = form.get('playTimeStartData');
		const endTimeCtrl = form.get('playTimeEndData');

		const defaultStartDate = moment(new Date()).format();
		const defaultEndDate = moment(new Date()).add(5, 'years').format();

		startDateCtrl.setValue(defaultStartDate, { emitEvent: false });
		endDateCtrl.setValue(defaultEndDate, { emitEvent: false });
		daysCtrl.setValue(this.days, { emitEvent: false });
		startTimeCtrl.setValue({ hour: 0, minute: 0, second: 0 }, { emitEvent: false });
		endTimeCtrl.setValue({ hour: 23, minute: 59, second: 59 }, { emitEvent: false });
	}
}
