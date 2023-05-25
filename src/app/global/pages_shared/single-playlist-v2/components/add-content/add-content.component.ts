import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { API_CONTENT } from 'src/app/global/models';

@Component({
	selector: 'app-add-content',
	templateUrl: './add-content.component.html',
	styleUrls: ['./add-content.component.scss']
})
export class AddContentComponent implements OnInit {
	selectedContents: API_CONTENT[] = [];
	selectedContentForSettings: API_CONTENT;
	gridCount = 8;

	constructor(@Inject(MAT_DIALOG_DATA) public _assets: API_CONTENT[]) {}

	ngOnInit() {
		console.log(this._assets);
	}

	public contentSelected(content: API_CONTENT) {
		if (this.selectedContents.includes(content)) this.selectedContents = this.selectedContents.filter((p) => p !== content);
		else this.selectedContents.push(content);
	}

	public contentSelectedForSettings(content: API_CONTENT) {}
}
