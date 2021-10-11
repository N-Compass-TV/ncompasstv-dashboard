import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { TAG_OWNER, TAG_TYPE } from 'src/app/global/models';
import { AuthService, TagService, } from 'src/app/global/services';

@Component({
	selector: 'app-tags',
	templateUrl: './tags.component.html',
	styleUrls: ['./tags.component.scss']
})
export class TagsComponent implements OnInit, OnDestroy {

	count = { dealer: 0, host: 0, advertiser: 0, license: 0 };
	currentTagType: TAG_TYPE;
	isContentReady = false;
	isLoadingCount = false;
	isOwnersTabLoading = false;
	owners: TAG_OWNER[] = [];
	ownersTabSearchKey = null;
	searchForm: FormGroup;
	tagTypes: TAG_TYPE[] = [];
	tagTypesMutated: TAG_TYPE[] = [];
	title = 'Tags';

	tagsTableSettings = { columns: this.getColumns() };
	tagOwnersTableSettings = { columns: this.getColumns('tag-owners') };
	
	protected _unsubscribe: Subject<void> = new Subject<void>();
	
	constructor(
		private _auth: AuthService,
		private _tag: TagService,
	) { }
	
	ngOnInit() {
		this.getAllTagTypes().add(() => this.isContentReady = true);
		this.getTagsCount();
		this.subscribeToTagsCountRefresh();
	}

	ngOnDestroy() {
		this._unsubscribe.next();
		this._unsubscribe.complete();
	}

	clickedTagName(event: { tag: string }): void {
		this.ownersTabSearchKey = event.tag;
	}

	get currentUserRole() {
		return this._auth.current_role;
	}

	private getAllTagTypes() {

		return this._tag.getAllTagTypes()
			.pipe(takeUntil(this._unsubscribe))
			.subscribe(
				(response: { tag_types: TAG_TYPE[] }) => {
					this.tagTypes = [ ...response.tag_types ] ;
					this.tagTypesMutated = [ ...response.tag_types ];
					this.tagTypesMutated.unshift({ tagTypeId: 0, name: 'All', dateCreated: null, status: null });
					this.currentTagType = response.tag_types.filter(type => type.name.toLowerCase() === 'dealer')[0];
				},
				error => console.log('Error retrieving tag types', error)
			);

	}

	private getColumns(table = '') {

		let columns: any[] = [
			{ name: '#', class: 'p-3 index-column-width' },
		];

		switch (table) {

			case 'tag-owners':
				columns.push(
					{ name: 'Assignee', class: 'p-3' },
					{ name: 'Tags', class: 'p-3' },
				);

				break;

			default:

				columns.push(
					{ name: 'Name', class: 'p-3' },
					{ name: 'Total', class: 'p-3' },
				);

				break;
		}

		columns.push({ name: 'Actions', class: 'p-3 text-center' });
		return columns;

	}

	private getTagsCount(): void {

		this.isLoadingCount = true;

		this._tag.getAllTagsCount()
			.pipe(takeUntil(this._unsubscribe), map(response => response.tags))
			.subscribe(
				(response: {}[]) => {
					response.forEach(data => Object.keys(data).forEach(key => this.count[key.toLowerCase()] = data[key]));
				},
				error => console.log('Error retrieving tags count ', error)
			)
			.add(() => this.isLoadingCount = false);

	}

	private subscribeToTagsCountRefresh() {
		
		this._tag.onRefreshTagsCount.pipe(takeUntil(this._unsubscribe))
			.subscribe(() => this.getTagsCount());
	}

}
