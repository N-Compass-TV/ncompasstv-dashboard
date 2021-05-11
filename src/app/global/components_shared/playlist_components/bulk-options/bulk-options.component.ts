import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material'
import { Subscription } from 'rxjs/internal/Subscription';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PlaylistService } from 'src/app/global/services/playlist-service/playlist.service';

@Component({
	selector: 'app-bulk-options',
	templateUrl: './bulk-options.component.html',
	styleUrls: ['./bulk-options.component.scss']
})

export class BulkOptionsComponent implements OnInit {

	enable_blacklisting: boolean = false;
	edit_fullscreen_status: boolean = false;
	selected_contents: any[];
	selected_content_backup: any[] = [];
	saved_selected_content_backup: any;
	subscription: Subscription = new Subscription;
	host_licenses: any[];
	duration = new FormControl();
	whitelisting = [];
	blocklisting = [];
	to_whitelist = [];
	blocklist_ids = [];

	constructor(
		@Inject(MAT_DIALOG_DATA) public _dialog_data: any,
		private _playlist: PlaylistService 
	) { }

	ngOnInit() {
		localStorage.removeItem('marked_content_backup');

		this.selected_contents = this._dialog_data.contents;
		this.host_licenses = this._dialog_data.host_licenses;
		this.selected_contents.forEach(
			i => {
				console.log('test', i)
				this.selected_content_backup.push(i)
			}
		)

		// this.selected_content_backup.map(
		// 	i => {
		// 		this.getBlacklistIdOfSelectedContents(i.playlistContentId)
		// 	}
		// )

		console.log(this.selected_contents);

		localStorage.setItem('marked_content_backup', JSON.stringify(this.selected_content_backup));
		this.saved_selected_content_backup =  JSON.parse(localStorage.getItem('marked_content_backup'));

		this.subscription.add(
			this.duration.valueChanges
			.pipe(debounceTime(1000), distinctUntilChanged())
			.subscribe(data => {
				console.log('#d', data);
				if (data >= 5) {
					this.selected_contents.forEach(i => {
						if (i.fileType !== 'webm') {
							i.duration = data;
						}
					})
				} else if(data == null  || data == undefined || data == '') {
					this.saved_selected_content_backup.forEach(
						i => {
							this.selected_contents.map(
								j => {
									if (i.playlistContentId == j.playlistContentId) {
										console.log('Changed', j.duration, i.duration)
										j.duration = i.duration;
									}
								}
							)
						}
					)
				} else {
					this.selected_contents.forEach(i => {
						if (i.fileType !== 'webm') {
							i.duration = 5;
						}
					})
				}
			})
		)
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	blackListing(e) {
		// Data from Child via Output()
		this.blocklisting = e;
		console.log('#blackListing', this.blocklisting);
	}

	// getBlacklistIdOfSelectedContents(id) {
	// 	this._playlist.get_blacklisted_by_id(id).subscribe(
	// 		(data: any[]) => {
	// 			console.log(data);
	// 			this.blocklist_ids.push(data.map(i => i.blacklistedContentId))
	// 			console.log(this.blocklist_ids);
	// 		}
	// 	)
	// }

	whiteListing(e) {
		// Data from Child via Output()
		this.whitelisting = e;
		console.log('#whiteListing', this.whitelisting);
		this.structureWhitelisting();
	}

	structureWhitelisting() {
		this.to_whitelist = [];

		this.selected_contents.forEach(
			i => {
				if (i.blacklistedContents && i.blacklistedContents.length > 0) {
					i.blacklistedContents.map(
						j => {
							if (this.whitelisting.includes(j.licenseId) && !this.to_whitelist.includes(j.blacklistedContentId)) {
								this.to_whitelist.push(j.blacklistedContentId);
							}
						}
					)
				}
			}
		)

		// list of blacklistedContentId to be whitelisted
		console.log('#ToWhiteList', this.to_whitelist);
	}

	setFullscreenStatus(e) {
		this.edit_fullscreen_status = e.checked;

		if (!e.checked) {
			console.log('orig', this.selected_content_backup);
			this.saved_selected_content_backup.forEach(
				i => {
					this.selected_contents.map(
						j => {
							if (i.playlistContentId == j.playlistContentId) {
								console.log('Changed', j.isFullScreen, i.isFullScreen)
								j.isFullScreen = i.isFullScreen;
							}
						}
					)
				}
			)
		} else {
			setTimeout(() => {
				this.toggleFullscreen({checked: false});
			}, 0)
		}
	}

	toggleFullscreen(e) {
		if (e.checked) {
			this.selected_contents.forEach(i => {
				i.isFullScreen = 1
			})
		} else {
			this.selected_contents.forEach(i => {
				i.isFullScreen = 0
			})
		}
	}
}
