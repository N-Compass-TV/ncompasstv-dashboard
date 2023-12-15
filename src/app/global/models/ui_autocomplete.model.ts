export interface UI_AUTOCOMPLETE {
	label: string;
	placeholder: string;
	data: UI_AUTOCOMPLETE_DATA[];
	disabled?: boolean;
	allowSearchTrigger?: boolean;
	initial_value?: { id: string; value: any }[];
}

export interface UI_AUTOCOMPLETE_DATA {
	id: any;
	value: any;
}
