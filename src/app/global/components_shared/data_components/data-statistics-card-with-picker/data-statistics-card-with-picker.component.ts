import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DealerService } from '../../../../global/services/dealer-service/dealer.service';
import { API_DEALER } from '../../../../global/models/api_dealer.model';

@Component({
  selector: 'app-data-statistics-card-with-picker',
  templateUrl: './data-statistics-card-with-picker.component.html',
  styleUrls: ['./data-statistics-card-with-picker.component.scss']
})
export class DataStatisticsCardWithPickerComponent implements OnInit {

    dealers: API_DEALER[];
    dealers_data: Array<any> = [];
    dealer_not_found: boolean;
    end_date: Date;
    is_loading: boolean = true;
    is_search: boolean = false;
    loading_data: boolean = true;
    loading_search: boolean = false;
    paging: any;
    searching: boolean = false;
    selected_dealer: string;
    selected_dealer_name: string = "";
    start_date: Date;
    subscription: Subscription = new Subscription();

    contentsForm: FormGroup = this._form_builder.group({ 
		start_date: [ '', Validators.required ],
		end_date: [ '', Validators.required ],
	});

    @Input() id: string;
	@Input() sub_title: string;
	@Input() total: string;
    @Input() label_array: [];
    @Input() value_array: [];
    @Input() whole_data: [];
    @Input() generate_chart: boolean;
    @Input() num_of_months: string;
    @Input() average: string;

    @Output() s_date: EventEmitter<any> = new EventEmitter;
    @Output() e_date: EventEmitter<any> = new EventEmitter;
    @Output() dealer_selected: EventEmitter<any> = new EventEmitter;

    constructor(
        private _form_builder: FormBuilder,
        private _dealer: DealerService,
    ) { }

    ngOnInit() {
        console.log(this.value_array)
        this.getDealers(1);
    }

    setDealerId(e) {
		if (e) {
			this.selected_dealer = e;
            this.getDealerDetails(e);
            this.checkIfCompleteData();
			this.dealer_not_found = false;
		} else {
			this.dealer_not_found = true;
		}
	}

    onSelectStartDate(e) {
        this.start_date = e.format('YYYY-MM-DD');
        this.checkIfCompleteData();
    }

    onSelectEndDate(e) {
        this.end_date = e.format('YYYY-MM-DD');
        console.log("E", this.end_date)
        this.checkIfCompleteData();
    }

    checkIfCompleteData() {
        if(this.end_date && this.start_date && this.selected_dealer) {
            this.s_date.emit(this.start_date);
            this.e_date.emit(this.end_date);
            this.dealer_selected.emit(this.selected_dealer);
            console.log("YES")
        }
    }

    getDealers(e) {
		this.loading_data = true;
		if(e > 1) {
			this.subscription.add(
				this._dealer.get_dealers_with_page(e, "").subscribe(
					data => {
						data.dealers.map (
							i => {
								this.dealers.push(i)
							}
						)
						this.paging = data.paging;
						this.loading_data = false;
					}
				)
			)
		} else {
			if(this.is_search) {
				this.loading_search = true;
			}
			
			this.subscription.add(
				this._dealer.get_dealers_with_page(e, "").subscribe(
					data => {
						this.dealers = data.dealers;
						this.dealers_data = data.dealers;
						this.paging = data.paging
						this.is_loading = false;
						this.loading_data = false;
						this.loading_search = false;
					}
				)
			)
		}
	}

    searchBoxTrigger(event) {
		this.is_search = event.is_search;
		this.getDealers(event.page);		
	}

    getDealerDetails(e) {
        this.subscription.add(
			this._dealer.get_dealer_by_id(e).subscribe(
                data => {
                    this.selected_dealer_name = data.businessName;
                }
            )
        )
    }

    searchData(e) {
		this.loading_search = true;
		this.subscription.add(
			this._dealer.get_search_dealer(e).subscribe(
				data => {
					if (data.paging.entities.length > 0) {
						this.dealers = data.paging.entities;
						this.dealers_data = data.paging.entities;
						this.loading_search = false;
					} else {
						this.dealers_data = [];
						this.loading_search = false;
					}
					this.paging = data.paging;
				}
			)
		)
	}
}