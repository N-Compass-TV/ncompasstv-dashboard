import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { Subject, Subscription } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import {
	AdvertiserService,
	AuthService,
	BillingService,
	ContentService,
	FeedService,
	HelperService,
	HostService,
	LicenseService,
	PlaylistService,
	ReleaseNotesService,
	ScreenService,
	UserService
} from 'src/app/global/services';

import { DEALER_UI_TABLE_ADVERTISERS, UI_CURRENT_USER, UI_DEALER_ORDERS, UI_ROLE_DEFINITION } from 'src/app/global/models';

import { ConfirmationModalComponent } from '../../page_components/confirmation-modal/confirmation-modal.component';
import { DeletePlaylistComponent } from '../../../components_shared/playlist_components/delete-playlist/delete-playlist.component';
import { EditableFieldModalComponent } from '../../page_components/editable-field-modal/editable-field-modal.component';
import { EditFeedComponent } from '../../feed_components/edit-feed/edit-feed.component';
import { MediaViewerComponent } from '../../../components_shared/media_components/media-viewer/media-viewer.component';
import { CloneFeedDialogComponent } from './dialogs/clone-feed-dialog/clone-feed-dialog.component';
import { ViewDmaHostComponent } from './dialogs/view-dma-host/view-dma-host.component';
import { dateFormat } from 'highcharts';

@Component({
	selector: 'app-data-table',
	templateUrl: './data-table.component.html',
	styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnInit {
	@Input() active_tab: string;
	@Input() advertiser_delete: boolean;
	@Input() billing_action: boolean;
	@Input() content_metrics: boolean;
	@Input() ctrl_column_label: string;
	@Input() ctrl_column: boolean;
	@Input() ctrl_toggle: boolean;
	@Input() can_toggle_email_notifications = false;
	@Input() current_user?: UI_CURRENT_USER;
	@Input() has_action = false;
	@Input() has_timestamp_beside_image = true;
	@Input() is_dealer: boolean;
	@Input() is_delete_enabled = false;
	@Input() is_view_only = false;
	@Input() license_delete: boolean;
	@Input() license_status_column: boolean;
	@Input() multiple_delete: boolean;
	@Input() media_array: any;
	@Input() new_table: boolean;
	@Input() page? = '';
	@Input() paging_details: any;
	@Input() playlist_delete: boolean;
	@Input() preview_column: boolean;
	@Input() preview_column_label: string;
	@Input() query_params: string;
	@Input() screen_delete: boolean;
	@Input() sort_column: string;
	@Input() sort_order: string;
	@Input() is_user_delete_enabled = false;
	@Input() table_columns: any;
	@Input() table_data: any;
	@Input() transaction_action: any;
	@Input() order_action: any;
	@Input() order_data: any;

	// Feed Controls
	@Input() feed_controls: boolean;
	@Input() feed_preview: boolean;
	@Input() feed_delete: boolean;
	@Input() feed_edit: boolean;
	@Output() delete_feed = new EventEmitter();
	@Output() edit_feed = new EventEmitter();
	@Output() delete_license = new EventEmitter();
	@Output() delete_screen = new EventEmitter();
	@Output() export_content_details = new EventEmitter();
	@Output() export_playlist = new EventEmitter();
	@Output() page_triggered = new EventEmitter();
	@Output() reload_page = new EventEmitter();
	@Output() toggle_triggered = new EventEmitter();
	@Output() update_info = new EventEmitter();
	@Output() delete_selected = new EventEmitter();
	@Output() to_sort_column = new EventEmitter();
	@Output() push_license_updates = new EventEmitter<string[]>();
	@Output() shipping = new EventEmitter();

	active_table: string;
	in_progress = false;
	selected_array: any = [];
	pagination: number;
	selectAll: boolean = false;
	subscription: Subscription = new Subscription();
	protected _unsubscribe = new Subject<void>();

	constructor(
		private _auth: AuthService,
		private _advertiser: AdvertiserService,
		private _billing: BillingService,
		private _content: ContentService,
		private _dialog: MatDialog,
		private _feed: FeedService,
		private _host: HostService,
		private _helper: HelperService,
		private _license: LicenseService,
		private _playlist: PlaylistService,
		private _release: ReleaseNotesService,
		private _router: Router,
		private _screen: ScreenService,
		private _user: UserService
	) {}

	ngOnInit() {
		this.table_data.map((data) => {
			Object.keys(data).forEach((key) => {
				if (data[key].table) {
					this.active_table = data[key].table;
				}
			});
		});

		this.subscribeToEmailNotificationToggleResult();
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
		this._unsubscribe.next();
		this._unsubscribe.complete();
	}

	copyToClipboard(val: string) {
		//create artificial textbox for selector
		const selBox = document.createElement('textarea');
		selBox.style.position = 'fixed';
		selBox.style.left = '0';
		selBox.style.top = '0';
		selBox.style.opacity = '0';
		selBox.value = val;
		document.body.appendChild(selBox);
		selBox.focus();
		selBox.select();
		document.execCommand('copy');
		document.body.removeChild(selBox);
	}

	canDelete(userRole: string): boolean {
		const restrictedRoles = ['Administrator', 'Super Admin', 'Technical Support', 'Dealer'];

		return !restrictedRoles.includes(userRole);
	}

	editGeneratedFeed(data) {
		if (this.is_view_only) return;
		const route = Object.keys(UI_ROLE_DEFINITION).find((key) => UI_ROLE_DEFINITION[key] === this._auth.current_user_value.role_id);
		this._router.navigate([`/${route}/feeds/edit-generated/${data.feed_id.value}`]);
	}

	onSelectRow(data: any, index: number): void {
		if (this.page !== 'dealers-orders' || this.in_progress) return;

		const order = data as UI_DEALER_ORDERS;

		if (order.has_viewed.value === 1) return;

		this.in_progress = true;

		const currentUserId = this._auth.current_user_value.user_id;

		this._billing
			.set_order_as_viewed({ orderId: order.order_no.value, createdBy: currentUserId })
			.pipe(takeUntil(this._unsubscribe))
			.subscribe(
				() => {
					const orders = [...(this.table_data as UI_DEALER_ORDERS[])];
					orders[index].index.is_new_order = false;
					orders[index].date.is_new_order = false;
					orders[index].order_no.is_new_order = false;
					orders[index].dealer_alias.is_new_order = false;
					orders[index].dealer_name.is_new_order = false;
					orders[index].quantity.is_new_order = false;
					orders[index].status.is_new_order = false;
					orders[index].has_viewed.is_new_order = false;
					orders[index].has_viewed.value = 1;
					this.table_data = [...orders];
					this._billing.on_click_order.emit();
				},
				(error) => (this.in_progress = false)
			)
			.add(() => (this.in_progress = false));
	}

	onPageChange(page: number): void {
		this.pagination = page;
		window.scrollTo(0, 0);
	}

	getPage(page: any): void {
		this.selected_array = [];
		this.page_triggered.emit(page);
		this.delete_selected.emit(this.selected_array);
		this.ngOnInit();
	}

	controlToggle(data, e) {
		const license_status = { id: data, status: e.checked };
		this.toggle_triggered.emit(license_status);
	}

	isActivatedOrAutoChargeEnabled(data: any) {
		return data.is_activated ? (data.is_activated.value === 1 ? 'checked' : 'false') : data.autocharge.value === 1 ? 'checked' : 'false';
	}

	mediaViewer_open(i): void {
		//prepare data to comply to media viewer component (because json structure is not the same as media library)
		this.media_array[i].file_name === this.media_array.fileName;

		this.media_array.map((i) => {
			i.file_name = i.fileName;
			i.file_type = i.fileType;
			i.created_by = i.createdBy;
			i.date_uploaded = i.dateCreated;
			i.file_size = i.filesize;
		});

		const dialog = this._dialog.open(MediaViewerComponent, {
			panelClass: 'app-media-viewer-dialog',
			data: {
				index: i,
				content_array: this.media_array,
				selected: this.media_array[i],
				is_advertiser: true
			}
		});

		dialog.componentInstance.is_view_only = this.is_view_only;
	}

	feedPreview_open(i): void {
		// let top = window.screen.height - 500;
		// top = top > 0 ? top/2 : 0;
		// let left = window.screen.width - 800;
		// left = left > 0 ? left/2 : 0;
		// let uploadWin = window.open(i.link, "_blank", "width=800, height=500" + ",top=" + top + ",left=30%" + left);
		// uploadWin.moveTo(left, top);
		// uploadWin.focus();
		window.open(i.link, '_blank').focus();
	}

	editFeed(e): void {
		if (this.is_view_only) return;

		let dialogRef = this._dialog.open(EditFeedComponent, { width: '600px', data: e });

		dialogRef.afterClosed().subscribe(
			(response) => {
				if (!response) return;
				this.reload_page.emit(true);
			},
			(error) => {
				throw new Error(error);
			}
		);
	}

	deleteFeed(id): void {
		this.warningModal('warning', 'Delete Feed', 'Are you sure you want to delete this feed?', '', 'feed_delete', id);
	}

	deleteAdvertiser(id) {
		this._content.get_content_by_advertiser_id(id).subscribe((data) => {
			this.warningModal(
				'warning',
				'Delete Advertiser',
				data.message
					? 'Are you sure you want to delete this advertiser?'
					: 'This advertiser has assigned contents. If you wish to continue, the contents of the advertiser will be unassigned.',
				'',
				data.message ? 'advertiser_delete' : 'advertiser_delete_force',
				id
			);
		});
	}

	viewReceipt(link): void {
		// window.location.href = link;
	}

	autoCharge(id) {}

	autoChargeToggle(e) {}

	deleteScreen(id) {
		this.warningModal('warning', 'Delete Screen', 'Are you sure you want to delete this screen?', '', 'screen_delete', id);
	}

	deletePlaylist(id): void {
		this._playlist.get_playlist_by_id(id).subscribe(
			(data) => {
				this.warningModal(
					'warning',
					'Delete Playlist',
					'Are you sure you want to delete this playlist?',
					'',
					data.screens.length ? 'playlist_delete' : 'playlist_delete_normal',
					id
				);
			},
			(error) => {
				throw new Error(error);
			}
		);
	}

	exportPlaylist(data): void {
		this.export_playlist.emit(data);
	}

	exportContentDetails(data): void {
		this.export_content_details.emit(data);
	}

	deleteLicense(id): void {
		this.warningModal('warning', 'Delete License', 'Are you sure you want to delete this license', '', 'license_delete', id);
	}

	getStatusColor(data: any) {
		let statusColor = '';

		switch (this.page) {
			case 'advertisers':
				const advertiser = data as DEALER_UI_TABLE_ADVERTISERS;
				statusColor = advertiser.status.value === 'A' ? 'text-primary' : 'text-gray';
				break;

			default:
				break;
		}

		return statusColor;
	}

	warningModal(status: string, message: string, data: string, return_msg: string, action: string, id: any): void {
		const dialogRef = this._dialog.open(ConfirmationModalComponent, {
			width: '500px',
			height: '350px',
			data: { status, message, data, return_msg, action }
		});

		dialogRef.afterClosed().subscribe((result) => {
			switch (result) {
				case 'screen_delete':
					var array_to_delete = [];
					array_to_delete.push(id);
					this.postDeleteScreen(array_to_delete);
					break;
				case 'feed_delete':
					this.postDeleteFeed(id);
					break;
				case 'license_delete':
					var array_to_delete = [];
					array_to_delete.push(id);
					this.licenseDelete(array_to_delete);
					break;
				case 'playlist_delete':
					this.playlistDelete(id);
					break;
				case 'playlist_delete_normal':
					this.playlistDelete(id);
					break;
				case 'advertiser_delete':
					this.advertiserDelete(id, 0);
					break;
				case 'advertiser_delete_force':
					this.advertiserDelete(id, 1);
					break;
				case 'user_delete':
					this.deleteUser(id);
					break;
				case 'delete-host-file':
					this._host.delete_file(id).subscribe(() => {
						switch (this.page) {
							case 'single-host-images-tab':
								this._helper.onRefreshSingleHostImagesTab.emit();
								break;

							case 'single-host-documents-tab':
								this._helper.onRefreshSingleHostDocumentsTab.emit();
								break;
						}
					});

					break;

				case 'push_update_all_licenses':
					this.pushAllLicenseUpdates(id);
					break;

				case 'delete-release-note':
					this._release.onDeleteNoteFromDataTable.emit({ releaseNoteId: id });
					break;

				default:
			}
		});
	}

	licenseDelete(data): void {
		this.subscription.add(
			this._license.delete_license(data).subscribe(
				() => this.update_info.emit(true),
				(error) => {
					throw new Error(error);
				}
			)
		);
	}

	advertiserDelete(id, force) {
		this.subscription.add(
			this._advertiser.remove_advertiser(id, force).subscribe(
				(data) => {
					this.update_info.emit(true);
				},
				(error) => {
					throw new Error(error);
				}
			)
		);
	}

	playlistDelete(id) {
		this.subscription.add(
			this._playlist.remove_playlist(id, 0).subscribe(
				(data) => {
					if (!data.screens) {
						this.update_info.emit(true);
					} else {
						this.deletePlaylistModal({ screens: data.screens, playlist_id: id });
					}
				},
				(error) => {
					throw new Error(error);
				}
			)
		);
	}

	postDeleteFeed(data): void {
		this.subscription.add(
			this._content.remove_content([{ contentid: data }]).subscribe(
				() => this.reload_page.emit(true),
				(error) => {
					throw new Error(error);
				}
			)
		);
	}

	postDeleteScreen(data): void {
		this.subscription.add(
			this._screen.delete_screen(data).subscribe(
				() => this.update_info.emit(true),
				(error) => {
					throw new Error(error);
				}
			)
		);
	}

	editField(fields: any, label: string, value: any): void {
		let width = '500px';

		const dialogParams: any = { width, data: { status: fields, message: label, data: value } };

		if (fields.dropdown_edit) dialogParams.height = '220px';

		const dialog = this._dialog.open(EditableFieldModalComponent, dialogParams);

		const close = dialog.afterClosed().subscribe(
			(response: string) => {
				close.unsubscribe();
				if (!response || response === '--') return;

				switch (label) {
					case 'License Alias':
						this.subscription.add(
							this._license.update_alias({ licenseId: fields.id, alias: response }).subscribe(
								() => this.openConfirmationModal('success', 'Success!', 'License Alias changed succesfully'),
								(error) => {
									throw new Error(error);
								}
							)
						);
						break;
					case 'Install Date':
						this.subscription.add(
							this._license.update_install_date(fields.id, response).subscribe(
								() => {
									this.openConfirmationModal('success', 'Success!', 'License Installation Date Updated!');
									this._helper.onUpdateInstallationDate.emit();
								},
								(error) => {
									throw new Error(error);
								}
							)
						);
						break;
					case 'Screen Type':
						const filter_screen = {
							screen: {
								screentypeid: response,
								screenid: fields.id,
								screenname: fields.name
							}
						};
						this.subscription.add(
							this._screen.edit_screen(filter_screen).subscribe(
								() => this.openConfirmationModal('success', 'Success!', 'Screen Type changed succesfully'),
								(error) => {
									throw new Error(error);
								}
							)
						);

					case 'Host Document Alias':
					case 'Host Photo Alias':
						this._host
							.update_file_alias(fields.id, response)
							.pipe(takeUntil(this._unsubscribe))
							.subscribe(() => this.openConfirmationModal('success', 'Success!', 'Alias changed'));
						break;

					default:
				}
			},
			(error) => {
				throw new Error(error);
			}
		);
	}

	deletePlaylistModal(value) {
		let dialogRef = this._dialog.open(DeletePlaylistComponent, {
			width: '600px',
			panelClass: 'app-media-modal',
			data: value,
			disableClose: true
		});

		dialogRef.afterClosed().subscribe((data) => {
			if (data != false) {
				this.update_info.emit(true);
			}
		});
	}

	openConfirmationModal(status, message, data): void {
		const dialog = this._dialog.open(ConfirmationModalComponent, {
			width: '500px',
			height: '350px',
			data: { status, message, data }
		});

		dialog.afterClosed().subscribe(() => this.update_info.emit(true));
	}

	viewListModal(status, message, data): void {
		const dialog = this._dialog.open(ViewDmaHostComponent, {
			width: '500px',
			height: '350px',
			data: { status, message, data }
		});

		// dialog.afterClosed().subscribe(() => this.update_info.emit(true));
	}

	onCheckboxSelect(id, event, data) {
		if (!event) {
			var index = this.selected_array.indexOf(id);
			if (index !== -1) {
				this.selected_array.splice(index, 1);
			}
		} else {
			this.selected_array.push(id);
		}
		this.delete_selected.emit(this.selected_array);
	}

	onCloneFeed(contentId: string) {
		const dialog = this._dialog.open(CloneFeedDialogComponent, { width: '500px' });

		dialog.afterClosed().subscribe((response: boolean | string) => {
			if (typeof response === 'boolean') return;

			this._feed
				.clone_feed(contentId, response, this.current_user.user_id)
				.pipe(takeUntil(this._unsubscribe))
				.subscribe(
					() => {
						this.openConfirmationModal('success', 'Success!', 'Feed cloned');
					},
					(error) => {
						throw new Error(error);
					}
				);
		});
	}

	updateCheck() {
		if (this.selectAll === true) {
			this.table_data.map((data) => {
				if (!this.checkIfDisabled(data)) {
					data.checked = true;
					Object.keys(data).forEach((key) => {
						if (data[key].key) {
							var d = data[key];
							this.selected_array.push(d.value);
						}
					});
				}
			});
		} else {
			this.table_data.map((data) => {
				data.checked = false;
				this.selected_array = [];
			});
		}
		this.delete_selected.emit(this.selected_array);
	}

	checkIfDisabled(data) {
		switch (this.active_table) {
			case 'license':
				if (data.pi_status.value == 1 || data.is_assigned.value) {
					return true;
				} else {
					return false;
				}
				break;
			default:
		}
	}

	sortByColumnName(column: string, order: string): void {
		const filter = {
			column: column,
			order: order
		};

		this.to_sort_column.emit(filter);
	}

	onDelete(dataId: string | number) {
		let status = 'warning';
		let message = '';
		let data = '';
		let return_msg = '';
		let action = '';

		switch (this.page) {
			case 'single-host-images-tab':
				message = 'Delete Image';
				data = 'Are you sure you want to delete this image?';
				action = 'delete-host-file';
				break;

			case 'single-host-documents-tab':
				message = 'Delete Dcocument';
				data = 'Are you sure you want to delete this document?';
				action = 'delete-host-file';
				break;

			case 'release-notes':
				message = 'Delete Release Note';
				data = 'Are you sure you want to delete this note?';
				action = 'delete-release-note';
				break;
		}

		this.warningModal(status, message, data, return_msg, action, dataId);
	}

	onDeleteUser(userId: string, email: string): void {
		this.warningModal('warning', 'Delete User', `Are you sure you want to delete ${email}?`, '', 'user_delete', userId);
	}

	onEdit(dataId: string): void {
		switch (this.page) {
			case 'release-notes':
				this._release.onEditNoteFromDataTable.emit({ releaseNoteId: dataId });
				break;
		}
	}

	onPushUpdateToAllLicenses(playlistId: string): void {
		this.warningModal('warning', 'Push Update to All Licenses', 'Are you sure you want to proceed?', '', 'push_update_all_licenses', playlistId);
	}

	onToggleEmailNotification(event: MouseEvent, tableDataIndex: number): void {
		event.preventDefault();
		const currentData: { allow_email: { value: string }; user_id: { value: string }; email: { value: string } } = this.table_data[tableDataIndex];
		const { allow_email, user_id, email } = currentData;
		const currentValue = allow_email.value;
		const userId = user_id.value;
		const currentEmail = email.value;
		this.table_data[tableDataIndex]['allow_email'].value = !currentValue;
		this._helper.onToggleEmailNotification.emit({ userId, value: !currentValue, tableDataIndex, currentEmail });
	}

	shipOrder(id, status) {
		const filter = {
			order_id: id,
			order_status: status
		};

		this.shipping.emit(filter);
	}

	private deleteUser(userId: string): void {
		this._user
			.deleteUser(userId)
			.pipe(takeUntil(this._unsubscribe))
			.subscribe(
				() => this._helper.onRefreshUsersPage.emit(),
				(error) => {
					throw new Error(error);
				}
			);
	}

	private pushAllLicenseUpdates(playlistId: string): void {
		this._playlist
			.get_playlist_by_id(playlistId)
			.pipe(
				takeUntil(this._unsubscribe),
				map((response) => {
					if (!response.licenses || response.licenses.length <= 0) return [];
					return response.licenses.map((license) => license.licenseId);
				})
			)
			.subscribe((licenses: string[]) => {
				if (licenses.length <= 0) return this.showConfirmationDialog('error', 'No licenses associated with this playlist');
				this.showConfirmationDialog('success', 'Succes! Pushed updates to all licenses with this playlist');
				this.push_license_updates.emit(licenses);
			});
	}

	private showConfirmationDialog(type: 'error' | 'success', message: string): void {
		const config = {
			width: '500px',
			height: '350px',
			data: { status: type, message, data: '' }
		};

		this._dialog.open(ConfirmationModalComponent, config);
	}

	private subscribeToEmailNotificationToggleResult(): void {
		this._helper.onResultToggleEmailNotification.pipe(takeUntil(this._unsubscribe)).subscribe(
			(response: { tableDataIndex: number; updated: boolean }) => {
				const { updated, tableDataIndex } = response;

				if (updated) return;

				const currentValue = this.table_data[tableDataIndex]['allow_email'].value;
				this.table_data[tableDataIndex]['allow_email'].value = !currentValue;
			},
			(error) => {
				throw new Error(error);
			}
		);
	}
}
