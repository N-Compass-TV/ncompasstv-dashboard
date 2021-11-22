import { Component, OnInit, Input, Output, EventEmitter, HostListener, OnDestroy } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { Subject } from 'rxjs';

import { HelperService } from 'src/app/global/services/helper-service/helper.service';
import { takeUntil } from 'rxjs/operators';
@HostListener('scroll', ['$event'])

@Component({
	selector: 'app-autocomplete-field',
	templateUrl: './autocomplete-field.component.html',
	styleUrls: ['./autocomplete-field.component.scss'],
	providers: [TitleCasePipe]
})

export class AutocompleteFieldComponent implements OnInit, OnDestroy {
	@Output() data_value = new EventEmitter;
	@Output() change_value = new EventEmitter;
	@Output() call_next_page = new EventEmitter;
	@Output() searched = new EventEmitter;
	@Output() search_triggered = new EventEmitter;
	@Input() data_reference: Array<any>;
	@Input() paging: any;
	@Input() disabled: boolean;
	@Input() autocompleteSetting: string = 'nope';
	@Input() key_of_value: string; 
	@Input() label: string;
	@Input() placeholder: string;
	@Input() primary_keyword: string;
	@Input() required: boolean;
	@Input() search_keyword: string;
	@Input() initial_value: string;
	@Input() is_scroll_next_disabled = false;
	@Input() new_value: string;
	@Input() no_edit: boolean;
	@Input() loading_data: boolean;
	@Input() loading_search: boolean;
	@Input() old: boolean = false;
	@Input() initial_load: boolean;
	@Input() reset_value: boolean;
	@Input() type?: string;

	view_value: string;
	search_result: Array<any>;
	search_via_api : boolean = false;
	timeOut;
	timeOutDuration = 1000;

	protected _unsubscribe: Subject<void> = new Subject<void>();

	constructor(
		private _helper: HelperService
	) { }

	ngOnInit() {
		this.view_value = this.initial_value;
		this.subscribeToResetField();
        document.addEventListener('click',this.customBlur)
	}

	ngOnDestroy() {
		this._unsubscribe.next();
		this._unsubscribe.complete();
        document.removeEventListener('click', this.customBlur)
	}

    customBlur = (e : any) => {
        if(e) {
            if(!e.target.className.includes('skip-blur')) {
                this.emptySearch();
            }
        }
        
    }

	dataSelected(data) {
		this.data_value.emit(data.target.getAttribute('data-value'));
		this.view_value = data.target.getAttribute('data-text');
		this.emptySearch();
	}

	emptySearch() {
		setTimeout(() => {
			this.search_result = [];
		}, 300)
	}

	initializeSearch(s) {
		if (s.target.value) {
			this.search_result = this.data_reference.filter(res => {
				if(res[this.primary_keyword].toLowerCase().includes(s.target.value.toLowerCase())) {
					return res;
				}
			})
		} else if(s.target.value === '') {
			this.search_result = this.data_reference;
		}
	}

	search(s) {
		if (s.target.value) {
			this.search_result = this.data_reference.filter(res => {
				if(res[this.primary_keyword].toLowerCase().includes(s.target.value.toLowerCase())) {
					return res;
				}
			})
		} else if(s.target.value === '') {
			this.search_result = this.data_reference;
		}
	}

	search_by_api(e) {
		clearTimeout(this.timeOut);

		// if (this.view_value){
			this.timeOut = setTimeout(() => {
				if(this.view_value.length >= 3) {
					this.search_via_api = true;
					this.searched.emit(this.view_value);
				} else {
					if(this.view_value.length == 0) {
						this.search_via_api = true;
						this.paging = true;
						this.call_next_page.emit({page: 1, is_search: true, no_keyword: true})
					}
				}
			}, this.timeOutDuration);
		// }
	}

	onChangeData(e) {
		this.change_value.emit(e.target.getAttribute('data-value'))
	}

	ngOnChanges() {
		if(this.reset_value) {
			this.view_value = "";
		}
		this.data_reference = this.data_reference;
		if(this.no_edit) {
			this.view_value = this.initial_value;
		} else {
			if(this.paging && this.search_via_api && this.data_reference.length > 0) {
				this.data_reference = this.data_reference;
				this.search_result = this.data_reference;
			} else {
			}
		}
	}
	
	onScroll(event) {

		if (this.is_scroll_next_disabled) return;

		if (event.target.offsetHeight + event.target.scrollTop == event.target.scrollHeight && event.target.scrollHeight != 0) {
			if(this.paging) {
				if(this.paging.hasNextPage) {
					this.timeOut = setTimeout(() => {
						this.call_next_page.emit({page: this.paging.page + 1, is_search: false})
					}, 1500);
				}
			}
		}
	}

	private subscribeToResetField(): void {

		this._helper.onResetAutocompleteField.pipe(takeUntil(this._unsubscribe)).subscribe(
			(response: string) => {
				if (response === this.type) this.ngOnInit();
			},
			error => console.log('Error on reset auto complete subscription', error)
		);

	}

}
