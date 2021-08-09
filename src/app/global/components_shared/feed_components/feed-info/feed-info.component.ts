import { EventEmitter, Output } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { API_FEED_TYPES } from 'src/app/global/models/api_feed.model';
import { FeedService } from 'src/app/global/services/feed-service/feed.service';
import { API_GENERATED_FEED, GenerateFeed } from '../../../../global/models/api_feed_generator.model';
import { AuthService } from '../../../../global/services/auth-service/auth.service';

@Component({
	selector: 'app-feed-info',
	templateUrl: './feed-info.component.html',
	styleUrls: ['./feed-info.component.scss']
})

export class FeedInfoComponent implements OnInit {
	@Input() dealers: {
		dealerId: string,
		businessName: string
	}[];
	@Input() is_dealer: boolean = false;
	@Input() editing: boolean = false;
	@Input() fetched_feed: API_GENERATED_FEED;
	@Input() feed_types: API_FEED_TYPES[];
	@Output() feed_info = new EventEmitter();

	filtered_options: Observable<{dealerId: string, businessName: string}[]>;
	generated_feed: GenerateFeed;
	new_feed_form: FormGroup;
	selected_dealer: string;


	constructor(
		private _auth: AuthService,
		private _form: FormBuilder
	) { }

	ngOnInit() {
		this.prepareFeedInfoForm();
		this.matAutoFilter();
	}

	/** Structure Feed Information and Pass */
	structureFeedInfo() {
		console.log(this.new_feed_form.value);
		this.feed_info.emit(this.new_feed_form.value);
	}

	/** New Feed Form Control Getter */
	get f() {
		return this.new_feed_form.controls;
	}

	/** Build Feed Information Form with fields of feed_title, description, assign_to */
	private prepareFeedInfoForm(): void {
		if (this.editing) {
			this.new_feed_form = this._form.group(
				{
					feed_title: [this.fetched_feed.feedTitle, Validators.required],
					description: [this.fetched_feed.description],
					assign_to: [{
						value: this.fetched_feed.dealer.businessName,
						disabled: true
					}, Validators.required],
					assign_to_id: [this.fetched_feed.dealerId, Validators.required]
				}
			)

			this.selected_dealer = this.fetched_feed.dealerId;
		} else {
			this.new_feed_form = this._form.group(
				{
					feed_title: ['', Validators.required],
					description: ['',],
					feed_type: ['', Validators.required],
					assign_to: [{
						value: '',
						disabled: this.is_dealer ? true : false
					}, Validators.required],
					assign_to_id: ['', Validators.required]
				}
			)
		}
	}

	/**
	 * Filter Method for the Angular Material Autocomplete
	 * @param {string} value The entered phrase in the field
	 * @returns {dealerId: string, businessName: string} Array of filtered results
 	 */
	private filter(value: string): {dealerId: string, businessName: string}[] {
		const filter_value = value.toLowerCase();
		const filtered_result = this.dealers.filter(i => i.businessName.toLowerCase().includes(filter_value));

		if (!this.is_dealer) {
			this.selected_dealer = filtered_result[0] && value ? filtered_result[0].dealerId : null;
			this.f.assign_to_id.setValue(this.selected_dealer) 
		}

		return filtered_result;
	}

	/** Initialize Angular Material Autocomplete Component */
	private matAutoFilter(): void {
		this.filtered_options = this.f.assign_to.valueChanges.pipe(
			startWith(''),
			map(value => this.filter(value))
		)
	}
}