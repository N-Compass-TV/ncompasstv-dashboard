import { Component, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { AuthService } from '../../../global/services/auth-service/auth.service';
import { UI_ROLE_DEFINITION, UI_ROLE_DEFINITION_TEXT } from '../../../global/models/ui_role-definition.model';
import { USER_LOGIN } from 'src/app/global/models/api_user.model';
import { UpcomingInstallModalComponent } from '../../../global/pages_shared/upcoming-install-modal/upcoming-install-modal.component';
import { MatDialog } from '@angular/material';
import * as moment from 'moment';

@Component({
	selector: 'app-login-form',
	templateUrl: './login-form.component.html',
	styleUrls: ['./login-form.component.scss']
})

export class LoginFormComponent implements OnInit {

	login_form: FormGroup;
	auth_error: boolean;
	error_msg: string;
	is_error: boolean;
	is_password_field_type = true;
	is_submitted: boolean;
	show_overlay: boolean;

	// Spinner
	color: ThemePalette = 'primary';
	mode: ProgressSpinnerMode = 'determinate';
	value = 50;

	isUpcomingInstallChecked: boolean = false;

	constructor(
		private _auth: AuthService,
		private _form: FormBuilder,
		private _router: Router,
		 private _dialog: MatDialog
	) { }

	control: string = 'username';

	login_form_view = [
		{
			label: 'Enter Email Address',
			control: 'username',
			placeholder: 'Ex: user@name.com',
			icon: 'fas fa-user',
			error: 'Email is required',
			type: 'email'
		},
		{
			label: 'Enter Password',
			control: 'password',
			placeholder: 'Password',
			icon: 'fas fa-lock',
			error: 'Password is required',
			type: 'password'
		}
	]

	ngOnInit() {
		this.login_form = this._form.group(
			{
				username: ['', Validators.required],
				password: ['', Validators.required]
			}
		);
	}

	// convenience getter for easy access to form fields
	get form() { return this.login_form.controls; }

	authUser(): void {
		this.is_submitted = true;

		if (this.login_form.invalid) {
			return;
		}
		
		this.show_overlay = true;

		this._auth.authenticate_user(this.login_form.value).pipe(first()).subscribe(
			(response: USER_LOGIN) => {
				
				const user_data = {
					user_id: response.userId,
					firstname: response.firstName,
					lastname: response.lastName,
					role_id: response.userRole.roleId,
					roleInfo: response.roleInfo,
					jwt: { token: response.token, refreshToken: response.refreshToken }
				};

				if (response.userRole.roleName === 'Sub Dealer') user_data.roleInfo.permission = response.userRole.permission;
				localStorage.setItem('current_user', JSON.stringify(user_data));
				localStorage.setItem('current_token', JSON.stringify(user_data.jwt));
				this._auth.startRefreshTokenTimer();
				this.redirectToPage(response.userRole.roleId);
				if(response.userRole.roleId === UI_ROLE_DEFINITION.administrator ||
					 response.userRole.roleId === UI_ROLE_DEFINITION.tech){
					//Show Modal
					let item = JSON.parse(localStorage.getItem('installation_ischecked'));
					if(item){
						let isNextDay = this.compareTime(item.timestamp, moment().toDate());
						if(isNextDay){
							this.openUpcomingInstallModal();
						}
						else{
							if(!item.value){
								this.openUpcomingInstallModal();
							}
						}
					}
					else{
						this.openUpcomingInstallModal();
					}
				}
			},
			error => {
				this.show_overlay = false;
				this.is_error = true;
				this.error_msg = `${error.error.message}`;
				console.log('Error authenticating user', error);
			}
		)
	}
	
	 compareTime(dateString:any, now:any){
        return moment(now).isAfter(dateString, 'day');
    }
	
	openUpcomingInstallModal(){
        let dialogRef = this._dialog.open(UpcomingInstallModalComponent, {
			height: '525px',
			width: '600px',
            disableClose: true,
            panelClass: 'custom-modalbox'
		});

		dialogRef.afterClosed().subscribe(result => {
            this.isUpcomingInstallChecked = result;
		});
    }

	async redirectToPage(role_definition: string): Promise<void> {
		let role: string;

		switch (role_definition) {
			case UI_ROLE_DEFINITION.administrator:
				role = UI_ROLE_DEFINITION_TEXT.administrator
				break;
			case UI_ROLE_DEFINITION.dealer:
				role = UI_ROLE_DEFINITION_TEXT.dealer
				break;
			case UI_ROLE_DEFINITION['sub-dealer']:
				role = UI_ROLE_DEFINITION_TEXT['sub-dealer'];
				break;
			case UI_ROLE_DEFINITION.host:
				role = UI_ROLE_DEFINITION_TEXT.host
				break;
			case UI_ROLE_DEFINITION.advertiser:
				role = UI_ROLE_DEFINITION_TEXT.advertiser
				break;
			case UI_ROLE_DEFINITION.tech:
				role = UI_ROLE_DEFINITION_TEXT.tech
				break;
			default:
				role = 'login';
		}


		await this._router.navigate([role]);

	}

	togglePasswordFieldType(): void {
		this.is_password_field_type = !this.is_password_field_type;
	}
}
