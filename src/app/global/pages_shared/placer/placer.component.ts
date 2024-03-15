import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';

import * as moment from 'moment';
import { Moment } from 'moment';
import { FormControl } from '@angular/forms';

//UPLOAD TODO COMPONENT SOON
import * as filestack from 'filestack-js';
import { environment } from 'src/environments/environment';

import { UI_PLACER_DATA, WORKSHEET } from 'src/app/global/models';
import { PlacerService, HostService, ExportService } from 'src/app/global/services';
import { API_PLACER } from '../../models/api_placer.model';

@Component({
    selector: 'app-placer',
    templateUrl: './placer.component.html',
    styleUrls: ['./placer.component.scss'],
})
export class PlacerComponent implements OnInit {
    @Input() host_id: string = '';

    placer_table_column = [
        { name: '#', sortable: false, no_export: true },
        { name: 'Placer Id', key: 'placerId' },
        { name: 'Placer Name', key: 'placerName', sortable: true, column: 'PlacerName' },
        { name: 'Host Name', key: 'hostName', sortable: true, column: 'HostName', unassigned: false },
        { name: 'Host ID', key: 'hostId', no_show: true, hidden: true, unassigned: false },
        { name: 'Dealer', key: 'dealerName', no_show: true, hidden: true, unassigned: false },
        { name: 'Category', key: 'category', no_show: true, hidden: true, unassigned: false },
        { name: 'General Category', key: 'generalCategory', no_show: true, hidden: true, unassigned: false },
        { name: 'Address', key: 'address', sortable: true, column: 'Address', unassigned: false },
        { name: 'City', key: 'hostCity', no_show: true, hidden: true, unassigned: false },
        { name: 'State', key: 'hostState', no_show: true, hidden: true, unassigned: false },
        { name: 'Zip Code', key: 'postalCode', no_show: true, hidden: true, unassigned: false },
        { name: 'Longitude', key: 'longitude', no_show: true, hidden: true, unassigned: false },
        { name: 'Latitude', key: 'latitude', no_show: true, hidden: true, unassigned: false },
        { name: 'Foot Traffic', key: 'footTraffic', sortable: true, column: 'FootTraffic' },
        {
            name: 'Average Dwell Time',
            key: 'averageDwellTime',
            sortable: true,
            column: 'AverageDwellTime',
        },
        { name: 'Month', key: 'month', sortable: true, column: 'Month' },
        { name: 'Upload Date', key: 'dateUploaded', sortable: true, column: 'DateUploaded' },
        { name: 'Uploaded By', key: 'uploadedBy' },
        {
            name: 'Publication Date',
            key: 'publicationDate',
            sortable: true,
            column: 'PublicationDate',
        },
        { name: 'Source File', key: 'sourceFile' },
        { name: 'Action', sortable: false, no_export: true },
    ];

    hosts_table_column = [
        { name: '#', sortable: false, no_export: true },
        { name: 'Host ID', sortable: true, key: 'hostId', hidden: true, no_show: true },
        { name: 'Host Name', sortable: true, column: 'HostName', key: 'hostName' },
        { name: 'Category', hidden: true, no_show: true, key: 'category' },
        { name: 'General Category', hidden: true, no_show: true, key: 'generalCategory' },
        { name: 'Dealer Name', sortable: true, column: 'BusinessName', key: 'businessName' },
        { name: 'Address', sortable: true, column: 'Address', key: 'address' },
        { name: 'City', sortable: true, column: 'City', key: 'city' },
        { name: 'State', sortable: true, column: 'State', key: 'state' },
        { name: 'Postal Code', sortable: true, column: 'PostalCode', key: 'postalCode' },
        { name: 'Timezone', sortable: true, column: 'TimezoneName', key: 'timezoneName' },
        { name: 'Total Licenses', sortable: true, column: 'TotalLicenses', key: 'totalLicenses' },
        { name: 'Tags', hidden: true, no_show: true, key: 'tagsToString' },
        {
            name: 'Business Hours',
            sortable: false,
            key: 'storeHoursParse',
            hidden: true,
            no_show: true,
        },
        {
            name: 'Total Business Hours',
            sortable: false,
            key: 'storeHoursTotal',
            hidden: true,
            no_show: true,
        },
        { name: 'DMA Rank', sortable: false, hidden: true, key: 'dmaRank', no_show: true },
        { name: 'DMA Code', sortable: false, hidden: true, key: 'dmaCode', no_show: true },
        { name: 'DMA Name', sortable: false, hidden: true, key: 'dmaName', no_show: true },
        { name: 'Latitude', sortable: false, hidden: true, key: 'latitude', no_show: true },
        { name: 'Longitude', sortable: false, hidden: true, key: 'longitude', no_show: true },
        { name: 'Vistar ID', no_show: true, key: 'vistarVenueId', no_show_to_da: true },
        { name: 'Notes', no_show: true, hidden: true, key: 'notes', no_show_to_da: true },
        { name: 'Others', no_show: true, hidden: true, key: 'others', no_show_to_da: true },
    ];

    date = new FormControl(moment());
    differentHours = 0;
    hostsData = [];
    hoursToStore = 0;
    hoursDifferentTempStore = [];
    placer_data: any[] = [];
    filtered_placer_data: any[] = [];
    filter: any = {
        assignee: '0',
        assignee_label: '',
        date_from: '',
        date_from_label: '',
        date_to: '',
        date_to_label: '',
    };
    host_name: string = '';
    initial_load_placer: boolean = false;
    original_placer_table_column: any[];
    placer_to_export: any[] = [];
    paging_data: any;
    searching_placer_data: boolean = true;
    search_keyword: string = '';
    sort_column: string = '';
    sort_order: string = '';
    total_placer: number = 0;
    unassignedHosts = [];

    //Export
    tableColumnToExport = [];
    unassignedGeneration = false;
    workbookGeneration = false;
    worksheet: WORKSHEET[];

    today: Date = new Date();
    pickerDateFrom = '';
    pickerDateTo = '';
    @ViewChild('pickerfrom', { static: false }) datePickerFrom: MatDatepicker<any>;
    @ViewChild('pickerto', { static: false }) datePickerTo: MatDatepicker<any>;

    protected _unsubscribe = new Subject<void>();

    constructor(
        private _placer: PlacerService,
        private _date: DatePipe,
        private _host: HostService,
        private _export: ExportService,
    ) {}

    ngOnInit() {
        this.original_placer_table_column = this.placer_table_column;
        if (this.host_id != '') {
            this._host
                .get_host_by_id(this.host_id)
                .pipe(takeUntil(this._unsubscribe))
                .subscribe((data) => (this.host_name = data.host.name));
        }
        this.checkForApiToCall();
        this.getHosts();
    }

    public checkForApiToCall(page?, for_export?) {
        if (this.host_id != '') return this.getPlacerForHost(page ? page : 1, for_export);
        this.getPlacerData(page ? page : 1, for_export);
    }

    private getPlacerForHost(page, is_export?) {
        if (!is_export) this.searching_placer_data = true;
        this._placer
            .get_single_host_placer(
                this.host_id,
                page,
                this.search_keyword,
                this.sort_column,
                this.sort_order,
                this.filter.assignee,
                this.filter.date_from,
                this.filter.date_to,
                15,
            )
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((data) => {
                this.searching_placer_data = false;
                this.mapData(data, is_export);
            })
            .add(() => {
                if (is_export) this.readyForExport();
            });
    }

    private getHosts() {
        this._host
            .get_host_minified()
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((hosts) => {
                this.hostsData = hosts.map((host) => {
                    return {
                        id: host.hostId,
                        value: `${host.name} | ${host.address}, ${host.city}`,
                    };
                });
            });
    }

    private getPlacerData(page, is_export?) {
        if (!is_export) this.searching_placer_data = true;
        this._placer
            .get_all_placer(
                page,
                this.search_keyword,
                this.sort_column,
                this.sort_order,
                this.filter.assignee,
                this.filter.date_from,
                this.filter.date_to,
                is_export ? 0 : 15,
            )
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((data) => {
                this.searching_placer_data = false;
                this.mapData(data, is_export);
            })
            .add(() => {
                if (is_export) this.readyForExport();
            });
    }

    private mapData(placer_data, is_export) {
        if (placer_data.message) {
            this.placer_data = [];
            this.filtered_placer_data = [];
            this.paging_data = [];
            this.total_placer = 0;
            return;
        }

        if (is_export) {
            this.placer_to_export = [...placer_data.paging.entities];
            this.modifyDataForExport(this.placer_to_export);
        } else {
            this.total_placer = placer_data.paging.totalEntities;
            this.paging_data = placer_data.paging;
            const mappedData = this.placer_mapToUIFormat(placer_data.paging.entities);
            this.placer_data = [...mappedData];
            this.filtered_placer_data = [...mappedData];
            this.initial_load_placer = false;
        }
    }

    private getUnassignedHosts() {
        this._placer
            .get_unassigned_host()
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((data) => {
                this.unassignedHosts = data.paging.entities;
                this.modifyDataForExport(this.unassignedHosts, true);
            })
            .add(() => {
                this.readyForExport(true);
            });
    }

    private readyForExport(isHost?: boolean) {
        let filename = 'Placer_Data';
        if (isHost) filename = 'Unassigned_Hosts';
        if (this.host_id != '') filename = `${this.host_name}_placer_data`;

        this.tableColumnToExport = isHost ? this.hosts_table_column : this.placer_table_column;
        this.tableColumnToExport = this.tableColumnToExport.filter((column) => !column.no_export);
        this.worksheet = [
            {
                name: filename,
                columns: this.tableColumnToExport,
                data: isHost ? this.unassignedHosts : this.placer_to_export,
            },
        ];
        this._export.generate(filename, this.worksheet);
        this.workbookGeneration = false;
        this.unassignedGeneration = false;
        this.placer_table_column = this.original_placer_table_column;
    }

    placer_mapToUIFormat(data: API_PLACER[]) {
        let count = this.paging_data.pageStart;
        return data.map((placer) => {
            const table = new UI_PLACER_DATA(
                { value: count++, link: null, editable: false, hidden: false },
                { value: placer.placerId, link: null, editable: false, key: false },
                {
                    value: placer.placerName,
                    link: null,
                    editable: true,
                    key: false,
                    label: 'Placer Name',
                    additional_params: {
                        placer: placer.placerId,
                        hostId: placer.hostId ? placer.hostId : null,
                    },
                },
                {
                    value: placer.hostName,
                    link: placer.hostId ? `/administrator/hosts/${placer.hostId}` : null,
                    editable: true,
                    dropdown_edit: true,
                    key: false,
                    new_tab_link: true,
                    label: 'Hosts',
                    hidden: false,
                    additional_params: {
                        placer: placer.placerId,
                        hostId: placer.hostId ? placer.hostId : null,
                        hostName: placer.hostName ? placer.hostName : '',
                        placername: placer.placerName ? placer.placerName : '',
                    },
                },
                {
                    value: `${placer.address}, ${placer.hostCity}` + `\n` + `${placer.hostState} ${placer.postalCode}`,
                    link: null,
                    editable: false,
                    key: false,
                },
                { value: placer.footTraffic, link: null, editable: false, key: false },
                { value: placer.averageDwellTime, link: null, editable: false, key: false },
                { value: placer.month, link: null, editable: false, key: false },
                {
                    value: this._date.transform(placer.dateUploaded, 'MMM d, y'),
                    link: null,
                    editable: false,
                    key: false,
                },
                { value: placer.uploadedBy, link: null, editable: false, key: false, compressed: true },
                {
                    value: this._date.transform(placer.publicationDate, 'MMM d, y'),
                    link: null,
                    editable: false,
                    key: false,
                },
                {
                    value: placer.sourceFile,
                    new_tab_link: false,
                    link: null,
                    editable: false,
                    hidden: false,
                    compressed: true,
                },
                {
                    value: placer.placerDumpId,
                    link: null,
                    editable: false,
                    key: false,
                    hidden: true,
                    no_show: true,
                },
            );
            return table;
        });
    }

    getColumnsAndOrder(event) {
        this.sort_column = event.column;
        this.sort_order = event.order;
        this.checkForApiToCall();
    }

    filterData(keyword) {
        this.search_keyword = keyword ? keyword : '';
        this.checkForApiToCall();
    }

    exportTable() {
        this.workbookGeneration = true;
        this.getDataForExport();
    }

    public exportUnassignedHosts(): void {
        this.unassignedGeneration = true;
        this.getUnassignedHosts();
    }

    private getDataForExport(): void {
        this.checkForApiToCall(1, true);
    }

    filterTable(value, label, is_date_from?, is_date_to?) {
        this.placer_table_column = this.original_placer_table_column;
        if (is_date_from) {
            this.filter.date_from = value;
            this.filter.date_from_label = label;
        } else if (is_date_to) {
            this.filter.date_to = value;
            this.filter.date_to_label = label;
        } else {
            if (value == 2) this.getUnassignedHosts();
            this.filter.assignee = value;
            this.filter.assignee_label = label;
        }

        if (this.filter.date_to_label || this.filter.assignee_label != '') this.checkForApiToCall();
    }

    private modifyDataForExport(data, isHost?: boolean) {
        data.map((placer, index) => {
            if (isHost) {
                this.getStoreHourseParse(placer);
                placer.storeHoursTotal = this.getTotalHours(placer);
                if (placer.tags && placer.tags.length) placer.tagsToString = placer.tags.join(',');
                return;
            }

            placer.dateUploaded = this._date.transform(placer.dateUploaded, 'MMM d, y');
            placer.publicationDate = this._date.transform(placer.publicationDate, 'MMM d, y');
        });
    }

    getTotalHours(data) {
        if (data.storeHours) {
            data.storeHoursForTotal = JSON.parse(data.storeHours);
            this.hoursDifferentTempStore = [];
            data.storeHoursForTotal.map((hours) => {
                if (hours.status) {
                    hours.periods.map((period) => {
                        this.differentHours = 0;
                        if (period.open && period.close) {
                            let close = moment(period.close, 'H:mm A');
                            let open = moment(period.open, 'H:mm A');

                            let time_start = new Date('01/01/2007 ' + open.format('HH:mm:ss'));
                            let time_end = new Date('01/01/2007 ' + close.format('HH:mm:ss'));

                            if (time_start.getTime() > time_end.getTime()) {
                                time_end = new Date(time_end.getTime() + 60 * 60 * 24 * 1000);
                                this.differentHours = (time_end.getTime() - time_start.getTime()) / 1000;
                            } else this.differentHours = (time_end.getTime() - time_start.getTime()) / 1000;
                        } else this.differentHours = 86400;
                        this.hoursDifferentTempStore.push(this.differentHours);
                    });
                }
            });
            this.hoursToStore = 0;
            this.hoursDifferentTempStore.map((hour) => (this.hoursToStore += hour));
        }
        return this.msToTime(this.hoursToStore);
    }

    private msToTime(input) {
        let totalSeconds = input;
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;

        return hours + 'h ' + minutes + 'm ' + seconds + 's ';
    }

    private getStoreHourseParse(data): void {
        let days = [];
        if (data.storeHours) {
            let storehours = JSON.parse(data.storeHours);
            storehours = storehours.sort((a, b) => {
                return a.id - b.id;
            });
            storehours.map((day) => {
                if (day.status) {
                    day.periods.map((period) => {
                        if (period.open == '' && period.close == '') days.push(day.day + ' : Open 24 hrs');
                        else days.push(day.day + ' : ' + period.open + ' - ' + period.close);
                    });
                } else days.push(day.day + ' : ' + 'Closed');
            });
            data.storeHoursParse = days.toString();
            data.storeHoursParse = data.storeHoursParse.split(',').join('\n');
        }
    }

    reloadPage(e: boolean): void {
        if (e) this.ngOnInit();
    }

    clearFilter() {
        this.filter = {
            assignee: '0',
            assignee_label: '',
            date_to: '',
            date_to_label: '',
            date_from: '',
            date_from_label: '',
        };
        this.pickerDateFrom = '';
        this.pickerDateTo = '';
        this.placer_table_column = this.original_placer_table_column;
        this.checkForApiToCall();
    }

    uploadPlacer() {
        const client = filestack.init(environment.third_party.filestack_api_key);
        client.picker(this.filestackOptions).open();
    }

    protected get filestackOptions(): filestack.PickerOptions {
        let folder = 'dev';
        if (environment.production) folder = 'prod';
        else if (environment.base_uri.includes('stg')) folder = 'staging';
        else folder = 'dev';

        return {
            storeTo: {
                location: 's3',
                container: 'n-compass-filestack/csv/' + folder,
                region: 'us-east-2',
            },
            accept: ['.csv'],
            maxFiles: 1,
            onUploadDone: (response) => {
                let filename = response.filesUploaded[0].key;
                let new_filename = filename.split('csv/' + folder + '/');
                this._placer
                    .upload_placer(new_filename[1])
                    .pipe(takeUntil(this._unsubscribe))
                    .subscribe(
                        () => this.ngOnInit(),
                        (error) => {
                            console.error(error);
                        },
                    );
            },
        };
    }

    closeDatePickerFrom(event) {
        this.pickerDateFrom = event;
        this.filterTable(moment(event).format('MMMM YYYY'), moment(event).format('MMMM YYYY'), true, false);
        this.datePickerFrom.close();
    }

    closeDatePickerTo(event) {
        this.pickerDateTo = event;
        this.filterTable(moment(event).format('MMMM YYYY'), moment(event).format('MMMM YYYY'), false, true);
        this.datePickerTo.close();
    }
}
