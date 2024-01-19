import { Observable } from 'rxjs';

export interface UI_AUTOCOMPLETE {
    label: string;
    placeholder: string;
    data: UI_AUTOCOMPLETE_DATA[];
    disabled?: boolean;
    allowSearchTrigger?: boolean;
    initialValue?: UI_AUTOCOMPLETE_DATA[];
    noData?: any;
    trigger?: Observable<any>;
}

export interface UI_AUTOCOMPLETE_DATA {
    id: any;
    value: any;
    display?: any;
}