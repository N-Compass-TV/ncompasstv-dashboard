import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';

import { debounceTime, distinctUntilChanged, map, startWith, takeUntil } from 'rxjs/operators';
import { UI_AUTOCOMPLETE, UI_AUTOCOMPLETE_DATA } from 'src/app/global/models';

@Component({
	selector: 'app-autocomplete',
	templateUrl: './autocomplete.component.html',
	styleUrls: ['./autocomplete.component.scss']
})
export class AutocompleteComponent implements OnInit {
	@Input() field_data: UI_AUTOCOMPLETE = {
		label: 'Label',
		placeholder: 'Type anything',
		data: []
	};

	@Output() value_selected: EventEmitter<{ id: string; value: string }> = new EventEmitter();
	@Output() no_data_found: EventEmitter<string> = new EventEmitter();

	autoCompleteControl = new FormControl();
	filteredOptions!: Observable<any[]>;

	constructor() {}

	ngOnInit() {
		this.filteredOptions = this.autoCompleteControl.valueChanges.pipe(
			startWith(''),
			debounceTime(1000),
			distinctUntilChanged(),
			map((keyword) => this._filter(keyword))
		);
	}

	displayOption(option: any): string {
		if (option && option.display) {
			return option.display;
		}

		return option ? option.value : '';
	}

	private _filter(keyword: any) {
		const filterValue = keyword.hasOwnProperty('value') ? keyword.value.toLowerCase() : keyword.toLowerCase();
		let filterResult = this.field_data.data.filter((option) => option.value.toLowerCase().includes(filterValue));

		// In an event that the keyword search returned does not have a result
		// then we trigger no_data_found event back so the parent can do something about it.
		if (!filterResult.length) {
			this.no_data_found.emit(keyword);

			// This means that the field_data.data source has been changed by the parent
			// and we need to fire it again for the existing search.
			if (this.field_data.allowSearchTrigger) {
				filterResult = this.field_data.data.filter((option) => option.value.toLowerCase().includes(filterValue));
			}
		}
		return filterResult;
	}

	valueSelected(e) {
		this.value_selected.emit(e.option.value);
	}
}
