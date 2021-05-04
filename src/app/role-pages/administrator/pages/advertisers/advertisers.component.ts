import { Component, OnInit } from '@angular/core';
import { AdvertiserService } from '../../../../global/services/advertiser-service/advertiser.service'
import { DealerService } from '../../../../global/services/dealer-service/dealer.service';
import { Subscription } from 'rxjs';
import { UI_DEALER_ADVERTISERS } from 'src/app/global/models/ui_table_dealer-advertisers.model';
import { API_DEALER } from 'src/app/global/models/api_dealer.model';
import { API_ADVERTISER } from 'src/app/global/models/api_advertiser.model';

@Component({
	selector: 'app-advertisers',
	templateUrl: './advertisers.component.html',
	styleUrls: ['./advertisers.component.scss']
})
export class AdvertisersComponent implements OnInit {

	advertiser_stats: any;
	title: string = "Advertisers";
	advertiser_table_column = [
		'#',
		'Dealer Alias',
		'Business Name',
		'Contact Person',
		// 'Region',
		// 'City',
		// 'State',
		'Advertiser Count'
	]
	paging_data: any;
	table_loading: boolean = true;
	no_advertiser: boolean = false;
	dealers_with_advertiser: any = [];
	subscription: Subscription = new Subscription;
	tab: any = { tab: 2 };
	filtered_data: any = [];
	searching: boolean = false;
	initial_load: boolean = true;
	search_data: string = "";

	constructor(
		private _advertiser: AdvertiserService,
		private _dealer: DealerService,
	) { }

	ngOnInit() {
		this.pageRequested(1);
		this.getAdvertiserTotal();
	}

	getAdvertiserTotal() {
		this.subscription.add(
			this._advertiser.get_advertisers_total().subscribe(
				data => {
					this.advertiser_stats = {
						basis: data.total,
						basis_label: 'Advertiser(s)',
						good_value: data.totalActive,
						good_value_label: 'Active',
						bad_value: data.totalInActive,
						bad_value_label: 'Inactive',
						new_this_week_value: data.newAdvertisersThisWeek,
						new_this_week_label: 'Advertiser(s)',
						new_this_week_description: 'New this week',
						new_last_week_value: data.newAdvertisersLastWeek,
						new_last_week_label: 'Advertiser(s)',
						new_last_week_description: 'New last week',
					}
				}
			)
		);
	}

	pageRequested(e) {
		this.searching = true;
		this.dealers_with_advertiser = [];
		this.subscription.add(
			this._dealer.get_dealers_with_advertiser(e, this.search_data).subscribe(
				data => {
					if(data.dealers) {
						this.dealers_with_advertiser = this.dealer_mapToUI(data.dealers);
						this.filtered_data = this.dealer_mapToUI(data.dealers);
					} else {
						if(this.search_data == "") {
							this.no_advertiser = true;
						}
						this.filtered_data = [];
					}
					this.paging_data = data.paging;
					this.searching = false;
					this.initial_load = false;
				},
				error => {
					console.log(error)
				}
			)
		)
	}

	filterData(data) {
		if (data) {
			this.search_data = data;
			this.pageRequested(1);
		} else {
			this.search_data = "";
			this.pageRequested(1);
		}
	}

	dealer_mapToUI(data: API_DEALER[]) {
		let count = 1;
		return data.filter(
			i => {
				return i.advertisers.length > 0;
			}
		).map(
			i => {
				return new UI_DEALER_ADVERTISERS(
					{ value: i.dealerId, link: null , editable: false, hidden: true},
					{ value: count++, link: null , editable: false, hidden: false},
					{ value: i.dealerIdAlias ? i.dealerIdAlias : '--',  link: '/administrator/dealers/' + i.dealerId,  query: '2', editable: false, hidden: false},
					{ value: i.businessName, link: '/administrator/dealers/' + i.dealerId , editable: false, hidden: false},
					{ value: i.contactPerson, link: null , editable: false, hidden: false},
					// { value: i.region, link: null , editable: false, hidden: false},
					// { value: i.city, link: null , editable: false, hidden: false},
					// { value: i.state, link: null , editable: false, hidden: false},
					{ value: i.advertisers.length, link: null , editable: false, hidden: false},
				)
			}
		)
	}
}
