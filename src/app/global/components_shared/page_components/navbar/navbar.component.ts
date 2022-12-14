import { Component, Input, OnInit } from '@angular/core';
import * as io from 'socket.io-client';
import { AuthService } from '../../../../global/services/auth-service/auth.service';
import { UserService } from '../../../../global/services/user-service/user.service';
import { UI_ROLE_DEFINITION } from '../../../../global/models/ui_role-definition.model';
import { NotificationService } from '../../../../global/services/notification-service/notification.service';
import { environment } from '../../../../../environments/environment';
import { NotificationsPaginated, Notification } from '../../../../global/models/api_notification.model';
@Component({
	selector: 'app-navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit {
	@Input() sidebar_state: boolean;
	current_username: string;
	current_userid: string;
	is_admin: boolean = false;
	is_dealer: boolean = false;
	has_alerts: boolean = false;
	
	notifications: Notification[];
	notification_paginated: NotificationsPaginated;
	notification_count: string;
	route: string;

	_socket: any;

	constructor(
		private _auth: AuthService,
		private _user: UserService,
		private _notification: NotificationService
	) { 
		this._socket = io(environment.socket_server, {
			transports: ['websocket'],
			query: 'client=Dashboard__NavbarComponent'
		});
	}

	ngOnInit() {
		if (this.currentUser) {
			const { firstname, user_id, role_id } = this.currentUser;
			this.current_username = firstname;
			this.current_userid = user_id;
            this.setCookieForOtherSite(this.current_userid);

			if (role_id === UI_ROLE_DEFINITION.administrator || role_id === UI_ROLE_DEFINITION.dealeradmin) {
				this.is_admin = true;
				this.route = '/administrator';
			}

			if (role_id === UI_ROLE_DEFINITION.dealer) {
				this.is_dealer = true;
				this.route = '/dealer';
			}
			
			this.getUserNotifications();
		}

		this.subscribeToResolvedAllEvent();

		this._socket.on('SS_notify', () => {
			this.getUserNotifications();
		});
	}

	/** Subscribe to the resolve_all_event_emitted$ in NotificationService */
	subscribeToResolvedAllEvent() {
		this._notification.resolve_all_event_emitted$.subscribe((data) => {
			if (data) {
				this.notification_paginated.totalEntities = 0;
				this.has_alerts = false;
			}
		});
	}

    setCookieForOtherSite(id) {
		this._user.set_cookie_for_other_site(id).subscribe(
			() => {
			}
		)
	}

	logOut() {
		this._auth.logout();
	}

	getUserNotifications() {
		if (this.is_admin) {
			this._notification.getAll().subscribe((data: any) => {
				this.notification_paginated = data;
				this.notification_count = this.notification_paginated.totalEntities.toString();
				this.notifications = data.entities;
				this.checkNewNotifications();
			});
		}

		if (this.is_dealer) {
			this._notification.getByDealerId(this.currentUser.roleInfo.dealerId).subscribe((data: NotificationsPaginated) => {
				this.notification_paginated = data;
				this.notification_count = this.notification_paginated.totalEntities.toString();
				this.notifications = data.entities;
				this.checkNewNotifications();
			});
		}
	}

	checkNewNotifications() {
		this.has_alerts = this.notifications.filter((i: Notification) => i.isOpened == 0).length > 0 ? true : false;
	}

	protected get currentUser() {
		return this._auth.current_user_value;
	}
}