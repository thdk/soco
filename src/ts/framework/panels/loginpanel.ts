import { Panel } from "../panel";

import * as firebase from 'firebase/app'
import 'firebaseui';
declare const firebaseui: any;

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