import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PlacerService } from 'src/app/global/services';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';

import * as moment from 'moment';
import { FormControl } from '@angular/forms';

import { UI_PLACER_DATA } from 'src/app/global/models';

@Component({
    selector: 'app-placer-data',
    templateUrl: './placer-data.component.html',
    styleUrls: ['./placer-data.component.scss'],
    providers: [DatePipe],
})
export class PlacerDataComponent implements OnInit {
    placer_table_column = [
        { name: '#', sortable: false, no_export: true },
        { name: 'Placer Id', key: 'placerId' },
        { name: 'Placer Name', key: 'placerName', sortable: true, column: 'PlacerName' },
        { name: 'Host Name', key: 'hostName', sortable: true, column: 'HostName' },
        { name: 'Foot Traffic', key: 'footTraffic', sortable: true, column: 'FootTraffic' },
        { name: 'Average Dwell Time', key: 'averageDwellTime', sortable: true, column: 'AverageDwellTime' },
        { name: 'Month', key: 'month', sortable: true, column: 'Month' },
        { name: 'Upload Date', key: 'dateUploaded', sortable: true, column: 'DateUploaded' },
        { name: 'Uploaded By', key: 'uploadedBy' },
        { name: 'Publication Date', key: 'publicationDate', sortable: true, column: 'PublicationDate' },
        { name: 'Source File', key: 'sourceFile' },
    ];

    date = new FormControl(moment());

    placer_data: any[] = [];
    filtered_placer_data: any[] = [];
    filter: any = {
        assignee: '0',
        assignee_label: '',
    };
    initial_load_placer: boolean = false;
    placer_to_export: any[] = [];
    paging_data: any;
    searching_placer_data: boolean = true;
    search_keyword: string = '';
    sort_column: string = 'DateUploaded';
    sort_order: string = 'desc';
    total_placer: number = 0;

    //Export
    workbook: any;
    workbook_generation = false;
    worksheet: any;

    protected _unsubscribe = new Subject<void>();

    constructor(private _placer: PlacerService, private _date: DatePipe) {}

    ngOnInit() {
        this.getPlacerData(1);
    }

    private getPlacerData(page, is_export?) {
        if (!is_export) {
            this.searching_placer_data = true;
        }
        this._placer
            .get_all_placer(page, this.search_keyword, this.sort_column, this.sort_order, this.filter.assignee, this.filter.date, is_export ? 0 : 15)
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((data) => {
                this.searching_placer_data = false;
                if (data.message) {
                    this.placer_data = [];
                    this.filtered_placer_data = [];
                    this.paging_data = [];
                    return;
                }
                if (is_export) {
                    this.placer_to_export = [...data.paging.entities];
                    this.modifyDataForExport(this.placer_to_export);
                } else {
                    this.total_placer = data.paging.totalEntities;
                    this.paging_data = data.paging;
                    const mappedData = this.placer_mapToUIFormat(data.paging.entities);
                    this.placer_data = [...mappedData];
                    this.filtered_placer_data = [...mappedData];
                    this.initial_load_placer = false;
                }
            })
            .add(() => {
                if (is_export) {
                    this.placer_to_export.forEach((item) => {
                        this.worksheet.addRow(item).font = { bold: false };
                    });

                    let rowIndex = 1;
                    for (rowIndex; rowIndex <= this.worksheet.rowCount; rowIndex++) {
                        this.worksheet.getRow(rowIndex).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                    }

                    this.workbook.xlsx.writeBuffer().then((file: any) => {
                        const blob = new Blob([file], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
                        const filename = 'Placer_Data' + '.xlsx';
                        saveAs(blob, filename);
                    });

                    this.workbook_generation = false;
                }
            });
    }

    placer_mapToUIFormat(data: any[]) {
        let count = this.paging_data.pageStart;
        return data.map((placer) => {
            const table = new UI_PLACER_DATA(
                { value: count++, link: null, editable: false, hidden: false },
                { value: placer.placerId, link: null, editable: false, key: false },
                { value: placer.placerName, link: null, editable: false, key: false },
                { value: placer.hostName, link: null, editable: false, key: false },
                { value: placer.footTraffic, link: null, editable: false, key: false },
                { value: placer.averageDwellTime, link: null, editable: false, key: false },
                { value: placer.month, link: null, editable: false, key: false },
                { value: this._date.transform(placer.dateUploaded, 'MMM d, y'), link: null, editable: false, key: false },
                { value: placer.uploadedBy, link: null, editable: false, key: false },
                { value: this._date.transform(placer.publicationDate, 'MMM d, y'), link: null, editable: false, key: false },
                { value: placer.sourceFile, link: null, editable: false, key: false }
            );
            return table;
        });
    }

    private getColumnsAndOrder(event) {
        this.sort_column = event.column;
        this.sort_order = event.order;
        this.getPlacerData(1);
    }

    private filterData(keyword) {
        this.search_keyword = keyword ? keyword : '';
        this.getPlacerData(1);
    }

    private exportTable() {
        this.workbook_generation = true;
        const header = [];
        this.workbook = new Workbook();
        this.workbook.creator = 'NCompass TV';
        this.workbook.useStyles = true;
        this.workbook.created = new Date();
        this.worksheet = this.workbook.addWorksheet('Placer Data');
        Object.keys(this.placer_table_column).forEach((key) => {
            if (this.placer_table_column[key].name && !this.placer_table_column[key].no_export) {
                header.push({
                    header: this.placer_table_column[key].name,
                    key: this.placer_table_column[key].key,
                    width: 30,
                    style: { font: { name: 'Arial', bold: true } },
                });
            }
        });
        this.worksheet.columns = header;
        this.getDataForExport();
    }

    private getDataForExport(): void {
        this.getPlacerData(1, true);
    }

    private filterTable(value, label, is_date?) {
        if (is_date) {
            this.filter.date = value;
            this.filter.date_label = label;
        } else {
            this.filter.assignee = value;
            this.filter.assignee_label = label;
        }
        this.getPlacerData(1);
    }

    private modifyDataForExport(data) {
        data.map((placer) => {
            placer.dateUploaded = this._date.transform(placer.dateUploaded, 'MMM d, y');
            placer.publicationDate = this._date.transform(placer.publicationDate, 'MMM d, y');
        });
    }

    private clearFilter() {
        this.filter = {
            assignee: '0',
            assignee_label: '',
        };
        this.getPlacerData(1);
    }

    chosenMonthHandler(normalizedMonth: moment.Moment, datepicker: any) {
        // console.log('NY', moment(normalizedYear).format('MMMM YYYY'));
        // const ctrlValue = moment().month(normalizedMonth);
        // console.log('NM', ctrlValue);
        // this.date.setValue(ctrlValue);
        // // const ctrlValue = this.date.value;
        // // ctrlValue.month(normalizedMonth.month());
        this.date.setValue(moment(normalizedMonth).format('MMMM YYYY'));
        this.filterTable(this.date, this.date.toString(), true);
        datepicker.close();
    }
}
