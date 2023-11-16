import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { MatDialog } from '@angular/material';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

import { AddFillerContentComponent } from '../add-filler-content/add-filler-content.component';
import { AddFillerGroupComponent } from '../add-filler-group/add-filler-group.component';
import { ConfirmationModalComponent } from 'src/app/global/components_shared/page_components/confirmation-modal/confirmation-modal.component';
import { DeleteFillerGroupComponent } from '../delete-filler-group/delete-filler-group.component';
import { EditFillerGroupComponent } from '../edit-filler-group/edit-filler-group.component';
import { FillerService, AuthService } from 'src/app/global/services';
import { FillerGridCategoryViewComponent } from '../filler-grid-category-view/filler-grid-category-view.component';

@Component({
	selector: 'app-filler-main-view',
	templateUrl: './filler-main-view.component.html',
	styleUrls: ['./filler-main-view.component.scss']
})
export class FillerMainViewComponent implements OnInit {
	active_view: string = 'folder';
	dimension: string = '';
	grid_data = [];
	original_grid_data = [];
	initial_loading = true;
	no_preview = true;
	no_preview_available = true;
	search_keyword: string = '';
	selected_preview = [];
	selected_preview_index = '';
	sorting_column: string = '';
	sorting_order: string = '';

	@Input() current_user_id: [];
	@Input() filler_data: [];
	@Input() filler_group: any;
	@Input() is_loading: boolean;
	@Input() no_search_result: boolean;
	@Input() restricted: boolean;

	@Output() get_fillers: EventEmitter<any> = new EventEmitter();
	@Output() refresh: EventEmitter<any> = new EventEmitter();

	protected _unsubscribe: Subject<void> = new Subject<void>();

	constructor(private _filler: FillerService, private _dialog: MatDialog, private _router: Router, private _auth: AuthService) {}

	ngOnInit() {}

	ngOnChanges() {
		this.is_loading = this.is_loading;
		this.no_search_result = this.no_search_result;
		this.filler_data = this.filler_data;
	}

	onSearchFiller(keyword) {
		this.is_loading = true;

		if (this.active_view === 'grid') {
			this.grid_data = keyword ? this.grid_data.filter((d) => d.name.includes(keyword.toLowerCase())) : this.original_grid_data;
		}
		if (keyword) this.search_keyword = keyword;
		else this.search_keyword = '';
		this.get_fillers.emit({ page: 1, keyword: keyword });
		this.is_loading = false;
	}

	sortFillerGroup(col, order) {
		this.sorting_column = col;
		this.sorting_order = order;
		this.get_fillers.emit({ page: 1, sort_col: this.sorting_column, sort_ord: this.sorting_order });
	}

	callNextPage(page) {
		this.get_fillers.emit({ page: page });
	}

	clearFilter() {
		this.is_loading = true;
		this.sorting_column = '';
		this.sorting_order = '';
		this.get_fillers.emit(1);
	}

	showAlbumPreview(id, index, filler_name?, index_arr?) {
		this.initial_loading = true;
		this.no_preview = false;
		this.selected_preview_index = index_arr;
		this.selected_preview = [];
		this._filler
			.get_filler_thumbnails(id, index)
			.pipe(takeUntil(this._unsubscribe))
			.subscribe((data: any) => {
				this.initial_loading = false;
				if (!data.message) {
					switch (data.length) {
						case 1:
							this.dimension = '150px';
							break;
						case 2:
							this.dimension = '120px';
							break;
						default:
							this.dimension = '85px';
							break;
					}
					data.map((fillers) => {
						if (fillers.fileType == 'webm') {
							let lastIndex = fillers.url.lastIndexOf('.');
							let requiredPath = fillers.url.slice(0, lastIndex + 1);
							fillers.url = requiredPath + 'jpg';
						}
						fillers.dimension = this.dimension;
					});
					this.no_preview_available = false;
					this.selected_preview = data;
					if (index > 4) {
						this.grid_data.splice(index_arr, 0, {
							id: id,
							name: filler_name.toLowerCase(),
							fillers: data
						});
						if (this.search_keyword == '') this.original_grid_data = this.grid_data;
						this.is_loading = false;
					}
				} else {
					this.no_preview_available = true;
					this.selected_preview = [];
					this.dimension = '150px';
					if (index > 4) {
						this.is_loading = false;
						this.grid_data.splice(index_arr, 0, {
							id: id,
							name: filler_name.toLowerCase(),
							fillers: []
						});
						if (this.search_keyword == '') this.original_grid_data = this.grid_data;
					}
				}
			});
	}

	hidePreview() {
		this.no_preview = true;
		this.selected_preview_index = '';
	}

	changeView(value) {
		this.active_view = value;
		this.grid_data = [];
		if (this.active_view == 'grid') {
			this.is_loading = true;

			//asynchronous api response since this is FE implementation only no BE available,
			// need to map to grid so sorting of original data will not change see splicing in showAlbumPreview function
			this.filler_data.map((filler: any, index) => {
				this.showAlbumPreview(filler.fillerGroupId, 6, filler.name, index);
			});
		}
	}

	removeFromGrid(id) {
		this.grid_data = this.grid_data.filter((grid) => {
			return grid.id != id;
		});
	}

	navigateToFillerGroup(id) {
		this._router.navigate([]).then(() => {
			window.open(`/${this.roleRoute}/fillers/view-fillers-group/` + id, '_blank');
		});
	}

	protected get roleRoute() {
		return this._auth.roleRoute;
	}

	onEditFillerGroup(id) {
		this._dialog
			.open(EditFillerGroupComponent, {
				width: '500px',
				data: {
					filler_group_id: id
				}
			})
			.afterClosed()
			.subscribe(() => {
				this.refresh.emit();
			});
	}

	onAddFillerGroup() {
		this._dialog
			.open(AddFillerGroupComponent, {
				width: '500px',
				data: {}
			})
			.afterClosed()
			.subscribe(() => {
				this.refresh.emit();
			});
	}

	addFillerContent(group) {
		this._dialog
			.open(AddFillerContentComponent, {
				width: '500px',
				data: {
					group: group
				}
			})
			.afterClosed()
			.subscribe(() => {
				this.refresh.emit();
			});
	}

	onDeleteFillerGroup(id) {
		//check first if any content is in used
		this._filler
			.validate_delete_filler_group(id)
			.pipe(takeUntil(this._unsubscribe))
			.subscribe((data: any) => {
				if (data.message) {
					this.openConfirmationModal('warning', 'Delete Filler Group', 'Are you sure you want to delete this filler group?', 'delete', id);
				} else {
					const delete_dialog = this._dialog.open(DeleteFillerGroupComponent, {
						width: '500px',
						height: '450px',
						data: {
							filler_feeds: data.fillerPlaylistGroups,
							filler_group_id: id
						}
					});

					delete_dialog.afterClosed().subscribe((result) => {
						if (!result) this.refresh.emit();
					});
				}
			});
	}

	continueToDeleteProcess(id) {
		this._filler
			.delete_filler_group(id)
			.pipe(takeUntil(this._unsubscribe))
			.subscribe((data: any) => {
				this.openConfirmationModal('success', 'Success!', 'Filler Group ' + data.message);
				this.refresh.emit();
			});
	}

	openConfirmationModal(status, message, data, action?, id?): void {
		this._dialog
			.open(ConfirmationModalComponent, {
				width: '500px',
				height: '350px',
				data: { status, message, data, delete: true, id }
			})
			.afterClosed()
			.subscribe((result) => {
				switch (result) {
					case 'delete':
						this.continueToDeleteProcess(id);
						break;
					default:
				}
			});
	}

	showMoreFillerCategory() {
		this._dialog
			.open(FillerGridCategoryViewComponent, {
				width: '500px',
				height: '350px',
				data: this.grid_data
			})
			.afterClosed()
			.subscribe((response) => {
				response.map((id) => {
					this.removeFromGrid(id);
				});
			});
	}
}
