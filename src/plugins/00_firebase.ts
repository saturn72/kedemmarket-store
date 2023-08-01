import { FirebaseApp, initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { Auth, getAuth } from "firebase/auth";
import { connectFunctionsEmulator, getFunctions, httpsCallable } from "firebase/functions";
import { useUserStore } from "@/stores/user";
import { AppCheck, initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const configureAuth = (app: FirebaseApp): Auth => {
    const auth = getAuth(app);
    auth.useDeviceLanguage();
    auth.currentUser;

    auth.onAuthStateChanged(user => {
        if (user) {
            useUserStore().setUser(user);
        }
        else {
            useUserStore().setUser(null);
            useNuxtApp().$router.push(useAppConfig().routes.login);
        }
    });
    return auth;
}

const configureAppCheck = (app: FirebaseApp): AppCheck | undefined => {
    if (process.env.NODE_ENV != 'production') {
        return undefined;
    }

    const k = useAppConfig().reCaptcha;
    return initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(k),
        isTokenAutoRefreshEnabled: true
    });
}

export default defineNuxtPlugin((nuxtApp) => {
    const app: FirebaseApp = initializeApp(useAppConfig().firebase);

    const auth = configureAuth(app);
    const appCheck = configureAppCheck(app);

    return {
        provide: {

            storage: {
                getDownloadUrl: async (uri: string): Promise<string | null> => {
                    while (uri.startsWith('/')) {
                        uri = uri.substring(1);
                    }
                    uri = uri.replaceAll("  ", " ").replaceAll(' ', '-').toLowerCase();

                    try {
                        const s = getStorage(app);
                        const r = ref(s, uri);
                        return await getDownloadURL(r);
                    } catch (error) {
                        createError({ data: error });
                        return null;
                    }
                }
            },
            user: {
                async logout(): Promise<any> {
                    await auth.signOut();
                }
            },
            backend: {

                async getCart(cart: {}): Promise<any> {
                    const functions = getFunctions();

                    if (process.env.NODE_ENV != 'production') {
                        connectFunctionsEmulator(functions, "127.0.0.1", 5001);
                    }

                    const po = httpsCallable(functions, 'getOrCreateCart');
                    const res = await po(cart);
                    return res.data;
                },

                async placeOrder(cart: {}): Promise<any> {
                    const functions = getFunctions();

                    if (process.env.NODE_ENV != 'production') {
                        connectFunctionsEmulator(functions, "127.0.0.1", 5001);
                    }

                    const po = httpsCallable(functions, 'submitOrder');
                    return await po(cart);
                },

                async updateCart(cart: {}) {
                    const functions = getFunctions();

                    if (process.env.NODE_ENV != 'production') {
                        connectFunctionsEmulator(functions, "127.0.0.1", 5001);
                    }

                    const po = httpsCallable(functions, 'updateCart');
                    return await po(cart);
                }
            }
        }
    }
});