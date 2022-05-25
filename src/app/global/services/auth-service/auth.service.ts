import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { UI_CURRENT_USER } from '../../models/ui_current-user.model';
import { tokenNotExpired } from 'angular2-jwt';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { JWT_TOKEN, USER_LOGIN } from '../../models/api_user.model';
import { UI_ROLE_DEFINITION } from '../../models/ui_role-definition.model';

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	current_user: Observable<UI_CURRENT_USER>;
	session_status: boolean;

	private current_user_subject: BehaviorSubject<UI_CURRENT_USER>;

	http_options = {
		headers: new HttpHeaders({ 'Content-Type': 'application/json' })
	};

	constructor(private _http: HttpClient, private _router: Router) {}

	// Store User Info inside Local Storage to a global variable.
	get current_user_value(): UI_CURRENT_USER {
		this.current_user_subject = new BehaviorSubject<UI_CURRENT_USER>(JSON.parse(localStorage.getItem('current_user')));
		this.current_user = this.current_user_subject.asObservable();
		return this.current_user_subject.value;

		// this.routes = Object.keys(UI_ROLE_DEFINITION).find(key => UI_ROLE_DEFINITION[key] === this._auth.current_user_value.role_id);
	}

	get current_role(): string {
		return Object.keys(UI_ROLE_DEFINITION).find((key) => UI_ROLE_DEFINITION[key] === this.current_user_value.role_id);
	}

	get session_valid(): boolean {
		return this.session_status;
	}

	//Login - Authenticate User
	authenticate_user(data) {
		return this._http
			.post<USER_LOGIN>(`${environment.base_uri}${environment.auth.api_login}?username=${data.username}&password=${data.password}`, {
				withCredentials: true
			})
			.pipe(
				map((current_user) => {
					let currentUser = new UI_CURRENT_USER();
					currentUser.user_id = current_user.userId;
					currentUser.firstname = current_user.firstName;
					currentUser.lastname = current_user.lastName;
					currentUser.role_id = current_user.userRole.roleId;
					currentUser.jwt = new JWT_TOKEN();
					currentUser.jwt.token = current_user.token;
					currentUser.jwt.refreshToken = current_user.refreshToken;
					this.current_user_subject.next(currentUser);
					return current_user;
				})
			);
	}

	get_user_http_only_cookie(user_id: string) {
		return this._http.get(`${environment.base_uri}${environment.getters.user_get_cookie}${user_id}`);
	}

	//Refresh Token
	refresh_token() {
		return this._http
			.post<JWT_TOKEN>(`${environment.base_uri}${environment.auth.api_refresh}`, JSON.stringify(this.current_user_value.jwt), this.http_options)
			.pipe(
				map((data) => {
					let currentUserStorage = JSON.parse(localStorage.getItem('current_user'));
					currentUserStorage.jwt.token = data.token;
					currentUserStorage.jwt.refreshToken = data.refreshToken;
					localStorage.setItem('current_user', JSON.stringify(currentUserStorage));

					let currentToken = JSON.parse(localStorage.getItem('current_token'));
					currentToken.token = data.token;
					currentToken.refreshToken = data.refreshToken;
					localStorage.setItem('current_token', JSON.stringify(currentToken));

					this.current_user_subject.next(currentUserStorage);
					this.startRefreshTokenTimer();
					return data;
				})
			);
	}

	//Helper methods
	private refreshTokenTimeout;

	public startRefreshTokenTimer() {
		if (this.current_user_value) {
			//parse object to get jwt token expiry
			const jwtTokenExpiry = JSON.parse(atob(this.current_user_value.jwt.token.split('.')[1])).exp;
			const expires = new Date(0);
			expires.setUTCSeconds(jwtTokenExpiry);
			const dateNow = new Date();
			const timeout = expires.getTime() - dateNow.getTime();
			//1 minute before the expiration
			const expiresTime = timeout - 60000;
			this.refreshTokenTimeout = setTimeout(() => this.refresh_token().subscribe(), expiresTime);
		}
	}

	private stopRefreshTokenTimer() {
		clearTimeout(this.refreshTokenTimeout);
	}

	session_check(status) {
		return (this.session_status = status);
	}

	// Check Token Life for AuthGuard
	token_life() {
		return tokenNotExpired('current_token');
	}

	// Remove user from local storage
	logout() {
		this.stopRefreshTokenTimer();
		this.current_user_subject.next(null);
		localStorage.removeItem('current_token');
		localStorage.removeItem('current_user');
		this._router.navigate(['/login']);
	}
}
