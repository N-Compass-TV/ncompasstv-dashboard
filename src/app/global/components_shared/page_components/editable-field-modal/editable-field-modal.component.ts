import { Component, OnInit, Input, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';
import * as moment from 'moment';

import { ScreenService } from '../../../services/screen-service/screen.service';
import { HostService } from 'src/app/global/services';
import { UI_AUTOCOMPLETE } from 'src/app/global/models';
@Component({
    selector: 'app-editable-field-modal',
    templateUrl: './editable-field-modal.component.html',
    styleUrls: ['./editable-field-modal.component.scss'],
})
export class EditableFieldModalComponent implements OnInit {
    message: string;
    status: any;
    data: string;
    date: any;
    hosts_data: UI_AUTOCOMPLETE[] = [];
    screen_init: string;
    screen_types: Array<any> = [];
    screen_selected: string = null;
    reset_screen: boolean = false;
    subscription: Subscription = new Subscription();

    constructor(
        @Inject(MAT_DIALOG_DATA) public _dialog_data: any,
        public dialogRef: MatDialogRef<EditableFieldModalComponent>,
        private _screen: ScreenService,
        private _host: HostService
    ) {}

    ngOnInit() {
        console.log('DIALOG', this._dialog_data);
        this.status = this._dialog_data.status;
        this.message = this._dialog_data.message;
        this.data = this._dialog_data.data;

        if (this.status.dropdown_edit) {
            switch (this.status.label) {
                case 'Screen Type':
                    this.getScreenType();
                    break;
                case 'Hosts':
                    this.getHosts();
                    break;
                default:
            }
        }

        if (this.status.label.includes('Date')) {
            const data = this.data;
            let value: any = moment(data).toDate();
            if (!data || data.trim().length <= 0 || data.includes('--')) value = moment();
            this.date = value;
        }
    }

    updateField(value: any): void {
        if (this.status.label.includes('Date')) value = moment(this.date).format('MM/DD/YYYY');
        this.dialogRef.close(value);
    }

    onSelectDate(value: any): void {
        this.date = moment(value, 'YYYY-MM-DD').toDate();
    }

    getScreenType() {
        this.subscription.add(
            this._screen.get_screens_type().subscribe((data) => {
                this.screen_types = data;
                this.screen_init = this.status.value;
                this.setScreenType(this.status.id);
            })
        );
    }

    getHosts() {
        this.subscription.add(
            this._host.get_host_minified().subscribe((data) => {
                this.hosts_data = [];
                data = data.map((host) => {
                    return {
                        value: host.name,
                        id: host.hostId,
                    };
                });

                this.hosts_data = [
                    {
                        label: 'Select Host',
                        placeholder: 'Ex. NCompass TV Host',
                        data: data,
                        // initialValue:
                        //     zone.screen_template.playlist_id && zone.screen_template.playlist_name
                        //         ? [
                        //                 {
                        //                     id: zone.screen_template.playlist_id,
                        //                     value: zone.screen_template.playlist_name
                        //                 }
                        //           ]
                        //         : []
                    },
                ];
            })
        );
    }

    setHost(host) {
        console.log('HOST', host);
    }

    setScreenType(type) {
        this.screen_selected = type;
        this.reset_screen = false;
    }

    clearScreenType() {
        this.screen_selected = null;
        this.reset_screen = true;
    }

    updateDropdown() {
        this.dialogRef.close(this.screen_selected);
    }
}
