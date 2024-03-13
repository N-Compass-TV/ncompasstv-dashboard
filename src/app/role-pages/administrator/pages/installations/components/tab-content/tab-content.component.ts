import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import * as moment from 'moment';

import { API_FILTERS, INSTALLATION, PAGING } from 'src/app/global/models';
import { FormControl } from '@angular/forms';
import { MatDatepicker } from '@angular/material';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-tab-content',
    templateUrl: './tab-content.component.html',
    styleUrls: ['./tab-content.component.scss'],
})
export class TabContentComponent implements OnInit, OnDestroy {
    @ViewChild('datePicker', { static: false }) datePicker: MatDatepicker<Date>;

    @Output() onExport = new EventEmitter<void>();
    @Output() onSearch = new EventEmitter<string>();
    @Output() onSelectDate = new EventEmitter<moment.Moment>();
    @Output() onSelectDateView = new EventEmitter<number>();
    @Output() onSelectPage = new EventEmitter<number>();
    @Output() onSortByColumnAndOrder = new EventEmitter<{ column: string; order: string }>();
    @Output() onTableRefresh = new EventEmitter<void>();

    @Input() currentFilters: API_FILTERS;
    @Input() filteredData: any[];
    @Input() isDatePickerEnabled = true;
    @Input() isDatePickerViewEnabled = true;
    @Input() isDateSelected: boolean;
    @Input() initialLoad: boolean;
    @Input() installation_count: any;
    @Input() installations: INSTALLATION[];
    @Input() isExporting: boolean;
    @Input() pagingData: PAGING;
    @Input() resetDatePicker: Observable<void>;
    @Input() searching: boolean;
    @Input() tableColumns: any[];
    @Input() tab: string;

    date = new FormControl(moment());
    private selectedDay = '';
    private selectedMonth = '';
    private selectedYear = '';
    dateViews = [];

    protected _unsubscribe = new Subject<void>();

    constructor() {}

    ngOnInit(): void {
        this.subscribeToResetDatePicker();

        this.dateViews = [
            { index: 0, name: 'Day', value: '' },
            { index: 1, name: 'Month', value: '' },
            { index: 2, name: 'Year', value: '' },
        ];
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    dateSelected(value: moment.Moment): void {
        this.onSelectDate.emit(value);
        this.datePicker.close();
        this.isDateSelected = true;
        this._dateViews();
    }

    searchInstallations(keyword: string): void {
        this.onSearch.emit(keyword);
    }

    private subscribeToResetDatePicker(): void {
        this.resetDatePicker.pipe(takeUntil(this._unsubscribe)).subscribe(() => this.date.setValue(new Date()));
    }

    public _dateViews() {
        this.selectedDay = moment(this.date.value).format('DD');
        this.selectedMonth = moment(this.date.value).format('MMM');
        this.selectedYear = moment(this.date.value).format('YYYY');

        this.dateViews = [
            { index: 1, name: 'Day', value: this.selectedDay },
            { index: 2, name: 'Month', value: this.selectedMonth },
            { index: 3, name: 'Year', value: this.selectedYear },
        ];

        // return this.dateViews;
    }

    trackByDateValue(index: number, view): string {
        return view.id;
    }

    clearDate() {
        this.isDateSelected = false;
    }
}
