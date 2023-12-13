export interface UI_AUTOCOMPLETE {
	label: string;
	placeholder: string;
	data: UI_AUTOCOMPLETE_DATA[];
    disabled?: boolean;
}

export interface UI_AUTOCOMPLETE_DATA {
    id: string,
    value: any
}