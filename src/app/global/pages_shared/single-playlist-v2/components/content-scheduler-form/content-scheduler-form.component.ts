import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as moment from 'moment';

import { DAYS } from '../../constants';
import { SinglePlaylistService } from '../../services/single-playlist.service';
import { MatCheckboxChange } from '@angular/material';
import { API_CONTENT_V2, PlaylistContentSchedule } from 'src/app/global/models';
import { NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-content-scheduler-form',
    templateUrl: './content-scheduler-form.component.html',
    styleUrls: ['./content-scheduler-form.component.scss'],
})
export class ContentSchedulerFormComponent implements OnInit, OnDestroy {
    @Input() contents: API_CONTENT_V2[] = [];

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
        type: [3, Validators.required],
    });

    protected _unsubscribe = new Subject<void>();

    constructor(
        private _form_builder: FormBuilder,
        private _playlist: SinglePlaylistService,
    ) {}

    ngOnInit() {
        this.subscribeToScheduleTypeSelection();
        this.subscribeToGetFormData();
        this.subscribeToFormChanges();
        this.setDefaultFormValues();
        this.subscribeToSetExistingFormData();
        this.getPlaylistContentSchedule();
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    onCheckboxChange(event: MatCheckboxChange) {
        const dayChanged = event.source.value as any;
        let currentDaysValue = this.schedulerForm.get('days').value as {
            dayId: number;
            day: string;
            checked: boolean;
        }[];

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
        const currentDaysValue = daysCtrl.value as {
            dayId: number;
            day: string;
            checked: boolean;
        }[];
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

    //TO FETCH DATA WHEN OPENING MODAL OR TRANSITIONING TO OTHER CONTENTS
    public getPlaylistContentSchedule() {
        if (this.contents) {
            this._playlist.getPlaylistScehduleByContentId(this.contents[0].playlistContentId).subscribe({
                next: (response) => {
                    const contentSchedule = response[0];
                    const days = response[0].days;
                    const daysLength = days.split(',');

                    this.setExistingScheduleFormValues(contentSchedule);
                    this.hasCheckedAllDays = daysLength.length === 7;
                },
            });
        }
    }

    private convertDateControlToISOString(form: FormGroup, controlName: string) {
        const controlValue = form.value[controlName];
        if (typeof controlValue === 'object')
            form.get(controlName).setValue((controlValue as Date).toISOString(), {
                emitEvent: false,
            });
    }

    private setExistingScheduleFormValues(data: PlaylistContentSchedule) {
        const { playTimeStart, playTimeEnd, from, to, alternateWeek, days } = data;
        this.alternateWeek = alternateWeek;
        this.hasAlternateWeekSet = alternateWeek === 1;
        const startDate = moment(from, 'YYYY-MM-DD hh:mm A').format();
        const endDate = moment(to, 'YYYY-MM-DD hh:mm A').format();
        const daysList = days.split(',');

        const parsedDays = this.days.map((data) => {
            data.checked = daysList.includes(`${data.dayId}`);
            return data;
        });

        const parsePlayTime = (data: string) => {
            // should be parsed to 24-hour format before assigning to timepicker
            const timeParsed = moment(data, 'hh:mm A').format('HH:mm').split(':');
            const hour = parseFloat(timeParsed[0]);
            const minute = parseFloat(timeParsed[1]);
            return { hour, minute, second: 0 };
        };

        this.form.patchValue({
            startDate,
            endDate,
            days: parsedDays,
            alternateWeek,
            playTimeStartData: parsePlayTime(playTimeStart),
            playTimeEndData: parsePlayTime(playTimeEnd),
        });
    }

    private setDefaultFormValues() {
        const defaultStartDate = moment(new Date()).format();
        const defaultEndDate = moment(new Date()).add(5, 'years').format();

        this.startDateCtrl.setValue(defaultStartDate, { emitEvent: false });
        this.endDateCtrl.setValue(defaultEndDate, { emitEvent: false });
        this.daysCtrl.setValue(this.days, { emitEvent: false });
        this.startTimeCtrl.setValue({ hour: 0, minute: 0, second: 0 }, { emitEvent: false });
        this.endTimeCtrl.setValue({ hour: 23, minute: 59, second: 59 }, { emitEvent: false });
    }

    private subscribeToFormChanges() {
        const form = this.schedulerForm;

        form.valueChanges.pipe(takeUntil(this._unsubscribe), debounceTime(1000)).subscribe({
            next: () => {
                this.convertDateControlToISOString(form, 'startDate');
                this.convertDateControlToISOString(form, 'endDate');

                this._playlist.schedulerFormUpdated.emit(form.value);

                const playStart = form.value.playTimeStartData as NgbTimeStruct;
                const playEnd = form.value.playTimeEndData as NgbTimeStruct;

                const isSetToPlayAllDay = (start: NgbTimeStruct, end: NgbTimeStruct) => {
                    return start.hour === 0 && start.minute === 0 && end.hour === 23 && end.minute === 59;
                };

                this.isCheckedToPlayAllDay = isSetToPlayAllDay(playStart, playEnd);
            },
        });
    }

    private subscribeToGetFormData() {
        this._playlist.requestSchedulerFormData.pipe(takeUntil(this._unsubscribe)).subscribe({
            next: () => {
                const form = this.schedulerForm;
                this._playlist.receiveSchedulerFormData.emit(form.value);
            },
        });
    }

    private subscribeToScheduleTypeSelection() {
        this._playlist.scheduleTypeSelected.pipe(takeUntil(this._unsubscribe)).subscribe({
            next: (response) => {
                this._playlist.schedulerFormUpdated.emit(response);
                if (!response.hasExistingSchedule && response.type === 3) this.setDefaultFormValues();
            },
        });
    }

    private subscribeToSetExistingFormData() {
        this._playlist.receiveExistingScheduleData.pipe(takeUntil(this._unsubscribe)).subscribe({
            next: (response) => {
                this.setExistingScheduleFormValues(response);
            },
        });
    }

    protected get form() {
        return this.schedulerForm;
    }

    protected get startDateCtrl() {
        return this.form.get('startDate');
    }

    protected get endDateCtrl() {
        return this.form.get('endDate');
    }

    protected get daysCtrl() {
        return this.form.get('days');
    }

    protected get startTimeCtrl() {
        return this.form.get('playTimeStartData');
    }

    protected get endTimeCtrl() {
        return this.form.get('playTimeEndData');
    }
}
