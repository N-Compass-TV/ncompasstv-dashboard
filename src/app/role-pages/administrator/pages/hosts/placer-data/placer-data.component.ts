import { Component, OnInit } from '@angular/core';
import { PlacerService } from 'src/app/global/services';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { UI_PLACER_DATA } from 'src/app/global/models';

@Component({
    selector: 'app-placer-data',
    templateUrl: './placer-data.component.html',
    styleUrls: ['./placer-data.component.scss'],
})
export class PlacerDataComponent implements OnInit {
    placer_table_column = [
        { name: '#', sortable: false, no_export: true },
        { name: 'Placer Id', key: 'placerId' },
        { name: 'Placer Name', key: 'placerName' },
        { name: 'Host Name', key: 'hostName' },
        { name: 'Foot Traffic', key: 'footTraffic' },
        { name: 'Average Dwell Time', key: 'averageDwellTime' },
        { name: 'Month', key: 'startDate' },
        { name: 'Upload Date', key: 'dateCreated' },
        { name: 'Uploaded By', key: 'updatedBy' },
        { name: 'Publication Date', key: 'publicationDate' },
        { name: 'Source File', key: 'startDate' },
    ];

    placer_data: any[] = [];
    filtered_placer_data: any[] = [];
    paging_data: any;
    searching_placer_data: boolean = true;

    protected _unsubscribe = new Subject<void>();

    constructor(private _placer: PlacerService) {}

    ngOnInit() {
        this.getPlacerData();
    }

    exportTable() {}

    private getPlacerData(page?) {
        this._placer
            .get_all_placer()
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((data) => {
                if (data.paging.entities.length > 0) {
                    this.paging_data = data.paging;
                    const mappedData = this.placer_mapToUIFormat(data.paging.entities);
                    this.placer_data = [...mappedData];
                    this.filtered_placer_data = [...mappedData];

                    // this.initial_load_dma = false;
                } else {
                    this.placer_data = [];
                    this.filtered_placer_data = [];
                    this.paging_data = [];
                }
                this.searching_placer_data = false;
            });
    }

    placer_mapToUIFormat(data: any[]) {
        console.log('DATA', data);
        let count = this.paging_data.pageStart;
        return data.map((placer) => {
            const table = new UI_PLACER_DATA(
                { value: count++, link: null, editable: false, hidden: false },
                { value: placer.placerId, link: null, editable: false, key: false },
                { value: placer.placerName, link: null, editable: false, key: false },
                { value: placer.hostName, link: null, editable: false, key: false },
                { value: placer.placerDump.footTraffic, link: null, editable: false, key: false },
                { value: placer.placerDump.averageDwellTime, link: null, editable: false, key: false },
                { value: placer.placerDump.month, link: null, editable: false, key: false },
                { value: placer.dateCreated, link: null, editable: false, key: false },
                { value: placer.updatedBy, link: null, editable: false, key: false },
                { value: placer.publicationDate, link: null, editable: false, key: false },
                { value: placer.placerDump.sourceFile, link: null, editable: false, key: false }
            );
            return table;
        });
    }
}
