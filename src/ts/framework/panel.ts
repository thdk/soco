import IPanel from '../interfaces/IPanel';

import * as firebase from 'firebase/app'
import 'firebaseui';
import { IIdea } from '../interfaces/IIdea';
import utils from './utils';

declare const firebaseui: any;

export class Panel<T> implements IPanel<T>{
    protected readonly containerEl: HTMLElement;
    private resolve?: (value: T | PromiseLike<T> | undefined) => void;
    private readonly addBodyClass: boolean;

    constructor(containerEl: HTMLElement, addBodyClass = true) {
        this.containerEl = containerEl;
        this.addBodyClass = addBodyClass;
    }

    public openAsync() {
        if (this.addBodyClass) {
            document.body.classList.add("panel-open");
        }

        this.containerEl.classList.add("active");

        return new Promise<T>((resolve, reject) => {
            this.resolve = resolve;
        });
    }

    public close(value: T) {

        this.containerEl.classList.remove("active");

        if (this.addBodyClass) {
            document.body.classList.remove("panel-open");
        }
        if (this.resolve) this.resolve(value);
    }
}


export class LoginPanel extends Panel<any> {
    private readonly firebaseUI: any;
    private readonly firebaseApp: any;

    constructor(containerEl: HTMLElement, firebaseUI: any, firebaseApp: firebase.app.App) {
        super(containerEl);
        this.firebaseApp = firebaseApp;
        this.firebaseUI = firebaseUI;
    }

    public openAsync():Promise<firebase.User> {
        // TODO: use type definition once available!
            const uiConfig = {
                // Url to redirect to after a successful sign-in.
                // 'signInSuccessUrl': 'chrome-extension://lbjdcodhahjohdkbigjhgmhikeflepdf/src/html/index.html?1',
                'callbacks': {
                    uiShown: () => {
                        super.openAsync();
                    },
                    signInSuccessWithAuthResult: (authResult: any, redirectUrl: any) => {
                        console.log(authResult);
                        this.close(authResult.user);
                        return false;
                    },
                    signInFailure: (errorCode: any, credential: any) => {
                        return new Promise((resolve, reject) => {
                            alert(errorCode);
                        });
                    }
                },
                // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
                signInFlow: 'popup',
                signInOptions: [{
                    provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                    'scopes': [
                        'https://www.googleapis.com/auth/plus.login'
                    ],
                    'customParameters': {
                        // Forces account selection even when one account
                        // is available.
                        'prompt': 'select_account'
                    }
                },
                {
                    provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
                    // Whether the display name should be displayed in Sign Up page.
                    requireDisplayName: true // true seems not to work:
                },
                firebase.auth.FacebookAuthProvider.PROVIDER_ID,
                ],
                // Terms of service url.
                'tosUrl': 'https://www.google.com',
                'credentialHelper': firebaseui.auth.CredentialHelper.NONE
            };

            this.firebaseUI.start('#firebaseui-auth-container', uiConfig);

            return super.openAsync();
    }
}

export class SubmitIdeaPanel extends Panel<IIdea | undefined> {
    private readonly firebaseApp: any;

    constructor(containerEl: HTMLElement, firebaseApp: firebase.app.App) {
        super(containerEl);
        this.firebaseApp = firebaseApp;
    }

    public openAsync():Promise<IIdea | undefined> {
        return new Promise((resolve, reject) => {
            const unsubscribeOnAuthChanged = this.firebaseApp.auth().onAuthStateChanged((user: firebase.User) => {
                unsubscribeOnAuthChanged();
                if (user && user.displayName) {
                    const authorEl = this.containerEl.querySelector("input.author") as HTMLInputElement;
                    utils.updateInputValue(authorEl, user.displayName);
                }
                resolve();
            });
        }).then(() => super.openAsync());
    }
}