import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';

import {environment} from "../../../environments/environment";
import CryptoJS from "crypto-js";
import {SessionDto} from "../../dtos/sesion.dto";

@Injectable({providedIn: 'root'})
export class AuthService
{
    login: string = environment.url;
    public sessionDto: SessionDto;

    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string)
    {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string
    {
        return localStorage.getItem('accessToken') ?? '';
    }
    set user(user: any) {
        localStorage.setItem('user',  JSON.stringify(user));
    }

    get user(): any {
        return localStorage.getItem('user') ?? 'null';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any>
    {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any>
    {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { username: string; password: string }): Observable<any> {
        console.log(credentials);
        credentials.password = CryptoJS.AES.encrypt(
            credentials.password,
            environment.keyEncrypt
        ).toString();
        console.log(credentials);
        // Throw error, if the user is already logged in
        if (this._authenticated) {
          console.log("aquiii")
        }

        /*return this._httpClient.post(`${this.loginSVC}/users/loginNormal`, credentials).pipe(
            switchMap((response: any) => {
console.log(response);

                // Store the access token in the local storage
                this.accessToken = response.accessToken;

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = response.user;

                // Return a new observable with the response
                return of(response);
            })
        );*/
        return this._httpClient
            .post<SessionDto>(`${this.login}auth/login`, credentials)
            .pipe(switchMap((u) => {
                console.log(u, "dto");

                this.sessionDto = u.jsonRes;
                console.log( "sessionDto",this.sessionDto);

                // Store the access token in the local storage
                this.accessToken = u.jsonRes.token;

                // Set the authenticated flag to true
                this._authenticated = true;
                console.log(u)
                // Store the user on the user service
                this._userService.user = u.jsonRes.user;
                console.log(this._userService.user )
                this.user = u.jsonRes.user;
                console.log(this.user  )

                // localStorage.setItem("accessToken", this.accessToken)

                // Return a new observable with the response
                // return of(u);



                if (this.estaAutenticado()) {
                    this.accessToken = u.jsonRes.token;
                    this.user = u.jsonRes.user;
                    return of(true);
                } else {
                    this._authenticated = false;
                    return of(false);
                }
            }));
    }

    estaAutenticado(): boolean {
        console.log(this.sessionDto.token)
        return !!this.sessionDto.token;
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any>
    {
        return this._httpClient.post('api/auth/sign-in-with-token', {
            accessToken: this.accessToken,
        }).pipe(
            catchError(() =>

                // Return false
                of(false),
            ),
            switchMap((response: any) =>
            {
                if ( response.accessToken )
                {
                    this.accessToken = response.accessToken;
                }

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = response.user;

                // Return true
                return of(true);
            }),
        );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any>
    {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: { name: string; email: string; password: string; company: string }): Observable<any>
    {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string }): Observable<any>
    {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean>
    {
        // Check if the user is logged in
        if (this._authenticated) {
            this._userService.user = JSON.parse(localStorage.getItem('user'));
            return of(true);
        }

        // Check the access token availability
        if (!this.accessToken) {
            localStorage.removeItem('user');
            return of(false);
        }

        // Check the access token expire date
        if (AuthUtils.isTokenExpired(this.accessToken)) {
            localStorage.removeItem('user');
            return of(false);
        }

        // If the access token exists, and it didn't expire, sign in using it
        return this.signInUsingToken();
    }
}
