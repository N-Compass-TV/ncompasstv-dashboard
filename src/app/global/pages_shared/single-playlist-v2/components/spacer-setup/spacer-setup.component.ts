import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

const DUMMY_AVAILABLE_CATEGORIES = [
	{
		categoryId: 1,
		categoryName: 'dealer',
		count: 3
	},
	{
		categoryId: 2,
		categoryName: 'host',
		count: 2
	},
	{
		categoryId: 3,
		categoryName: 'advertiser',
		count: 2
	},
	{
		categoryId: 4,
		categoryName: 'fillers',
		count: 1
	}
];

@Component({
	selector: 'app-spacer-setup',
	templateUrl: './spacer-setup.component.html',
	styleUrls: ['./spacer-setup.component.scss']
})
export class SpacerSetupComponent implements OnInit {
	availableContentCategories = DUMMY_AVAILABLE_CATEGORIES;
	spacerInfo: FormGroup = this._form_builder.group({
		spacerName: ['', Validators.required],
		spacerDescription: ['', Validators.required],
		spacerAlgoFields: this._form_builder.array([])
	});

	constructor(private _form_builder: FormBuilder) {
		this.setDynamicSpacerAlgoFields(this.availableContentCategories);
	}

	ngOnInit() {}

	setDynamicSpacerAlgoFields(contentCategories: any[]) {
		/** Initialize dynamic spacer algo fields
		 * @todo - fields added to the dynamic spacer algo fields form array
		 * should be calculated based on the available categories on playlist contents in a playlist
		 * If there's no playlist content set as dealer category, then the dealer field should not show up
		 * the field name should also be set based from the category name assigned to the playlist content.
		 */

		contentCategories.map((c: any) => {
			const contentCategoryBasedFields = {};

			Object.assign(contentCategoryBasedFields, {
				[c.categoryName]: ['', Validators.required]
			});

			this.dynamicSpacerAlgoFields.push(this._form_builder.group(contentCategoryBasedFields));
		});

		this.spacerInfo.valueChanges.subscribe((p) => {
			console.log(p);
		});
	}

	get dynamicSpacerAlgoFields() {
		return this.spacerInfo.get('spacerAlgoFields') as FormArray;
	}
}
