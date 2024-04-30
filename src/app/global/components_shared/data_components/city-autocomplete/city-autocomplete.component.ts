import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    ChangeDetectionStrategy,
    SimpleChanges,
    OnChanges,
} from '@angular/core';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { forkJoin, ObservableInput, Subject } from 'rxjs';

import { CITIES_STATE, CityData } from 'src/app/global/models/api_cities_state.model';
import { LocationService } from 'src/app/global/services';
import { CITIES_STATE_DATA, UI_CITY_AUTOCOMPLETE, UI_CITY_AUTOCOMPLETE_DATA } from 'src/app/global/models';

@Component({
    selector: 'app-city-autocomplete',
    templateUrl: './city-autocomplete.component.html',
    styleUrls: ['./city-autocomplete.component.scss'],
})
export class CityAutocompleteComponent implements OnInit, OnChanges {
    cityFromGoogleScrape: any;
    citiesStateData: CITIES_STATE;
    finalCityList: any[];

    // New Autocomplete Dependencies
    cityFieldData: UI_CITY_AUTOCOMPLETE = {
        label: 'City',
        placeholder: 'Type a city',
        data: [],
        initialValue: [],
        allowSearchTrigger: true,
    };
    @Input() selected_city_from_google: string;
    @Output() city_selected: EventEmitter<any> = new EventEmitter();

    protected _unsubscribe = new Subject<void>();

    constructor(private _location: LocationService) {}

    ngOnInit() {
        this.getCitiesAndStates();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.selected_city_from_google.currentValue) {
            this.selected_city_from_google = this.selected_city_from_google;
            this.cityFromGoogleScrape = this.finalCityList.find(
                (cityData) => cityData.display === this.selected_city_from_google,
            );
        }
    }

    private getCitiesAndStates(page?: number) {
        this._location
            .get_cities_data(page)
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((response) => {
                this.citiesStateData = response;
                this.citiesStateData.data.map((cityData: CityData) => {
                    this.addCitiesToDropdown(cityData);
                });
            })
            .add(() => {
                if (this.citiesStateData.paging.currentPage != this.citiesStateData.paging.pages)
                    this.getCitiesAndStates(this.citiesStateData.paging.currentPage + 1);
                else this.finalCityList = this.cityFieldData.data;
            });
    }

    addCitiesToDropdown(data: CityData) {
        let cityMap = {
            id: data.id,
            value: `${data.city}, ${data.state}`,
            display: data.city,
            country: data.country,
            state: data.abbreviation,
            region: data.region,
        };
        this.cityFieldData.data.push(cityMap);
    }

    resetCityList(keyword: string) {
        this.cityFieldData.data = [];

        this.searchCity(keyword).subscribe(
            (response) => {},
            (err) => {
                this.cityFieldData.noData = `${keyword} not found`;
                this.cityFieldData.data = this.finalCityList;
            },
        );
    }

    selectedCity(data: UI_CITY_AUTOCOMPLETE_DATA) {
        data ? this.city_selected.emit(data) : this.city_selected.emit(null);
    }

    private searchCity(keyword: string) {
        return this._location.get_cities_data(1, keyword).pipe(takeUntil(this._unsubscribe));
    }
}
