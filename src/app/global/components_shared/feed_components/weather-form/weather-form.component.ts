import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { API_CONTENT } from '../../../../global/models/api_content.model';
import { FeedMediaComponent } from '../feed-media/feed-media.component';

@Component({
	selector: 'app-weather-form',
	templateUrl: './weather-form.component.html',
	styleUrls: ['./weather-form.component.scss']
})

export class WeatherFormComponent implements OnInit {
	@Input() selected_dealer: string;
	@Output() open_media_library = new EventEmitter;

	is_marking: boolean = false;

	font_family = [
		{
			label: 'Helvetica'
		},
		{
			label: 'Poppins'
		},
		{
			label: 'Roboto'
		}
	]

	orientation = [
		{
			label: 'Vertical'
		},
		{
			label: 'Horizontal'
		}
	]

	weather_form: FormGroup;
	weather_form_fields = [
		{
			label: 'Background Image',
			form_control_name: 'backgroundImage',
			type: 'text',
			width: 'col-lg-6', 
			viewType: 'upload',
			required: true
		},
		{
			label: 'Banner',
			form_control_name: 'banner',
			type: 'text',
			width: 'col-lg-6', 
			viewType: 'upload',
			required: true
		},
		{
			label: 'Box Background Color',
			form_control_name: 'boxBackgroundColor',
			type: 'text',
			viewType: 'colorpicker',
			colorValue: '',
			width: 'col-lg-4', 
			required: true
		},
		{
			label: 'Days Font Color',
			form_control_name: 'daysFontColor',
			type: 'text',
			width: 'col-lg-4', 
			viewType: 'colorpicker',
			colorValue: '',
			required: true
		},
		{
			label: 'Number of days to display',
			form_control_name: 'daysToDisplay',
			type: 'number',
			width: 'col-lg-4', 
			required: true
		},
		{
			label: 'Font Family',
			form_control_name: 'fontFamily',
			type: 'text',
			width: 'col-lg-4', 
			viewType: 'select',
			options: this.font_family,
			required: true
		},
		{
			label: 'Zip Code',
			form_control_name: 'zipCode',
			type: 'text',
			width: 'col-lg-4', 
			required: true
		},
		{
			label: 'Orientation',
			form_control_name: 'orientation',
			type: 'text',
			width: 'col-lg-4', 
			viewType: 'select',
			options: this.orientation,
			required: true
		},
	]

	constructor(
		private _form: FormBuilder,
		private _dialog: MatDialog,
	) { }

	ngOnInit() {
		let form_group_obj = {};

		this.weather_form_fields.map(
			i => {
				Object.assign(form_group_obj, {
					[i.form_control_name]: ['', Validators.required]
				})
			}
		)

		this.weather_form = this._form.group(form_group_obj)
	}

	colorPicker(e, form_control_name) {
		console.log(e, form_control_name);
		this.weather_form.get(form_control_name).setValue(e);
		console.log(this.weather_form.get(form_control_name).value)
	}

	/** Open Media Library where contents are assigned to selected dealer */
	openMediaLibraryModal(form_control_name: string): void {
		let dialog = this._dialog.open(FeedMediaComponent, {
			width: '1024px',
			data: {
				dealer: this.selected_dealer,
				singleSelect: true
			}
		})

		dialog.afterClosed().subscribe((data: API_CONTENT[]) => {
			if (data && data.length > 0) {
				
			}
		})
	}

	/** Weather Form Control Getter */
	private get f() {
		return this.weather_form.controls;
	}
}