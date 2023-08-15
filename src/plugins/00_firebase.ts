import { FirebaseApp, initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { Auth, getAuth } from "firebase/auth";
import { connectFunctionsEmulator, getFunctions, httpsCallable } from "firebase/functions";
import { useUserStore } from "@/stores/user";
import { AppCheck, initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { CheckoutCart, Order, UserCart } from "model";

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

const executeFunction = async (functionName: string, payload?: any): Promise<any> => {
    const f = getFunctions();
    if (process.env.NODE_ENV != 'production') {
        connectFunctionsEmulator(f, "127.0.0.1", 5001);
    }

    const po = httpsCallable(f, functionName);
    const res = await po(payload);
    return res.data;
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

                async getOrders(): Promise<Order[]> {
                    return await executeFunction('getOrders');
                },

                async prepareCartForCheckout(cart: UserCart): Promise<CheckoutCart & any> {
                    return await executeFunction('prepareCartForCheckout', cart);
                },

                async getCart(cart: UserCart): Promise<UserCart> {
                    return await executeFunction('getOrCreateCart', cart);
                },

                async placeOrder(cart: CheckoutCart): Promise<Order> {
                    return await executeFunction('submitOrder', cart);
                },

                async updateCart(cart: UserCart): Promise<void> {
                    executeFunction('updateCart', cart);
                }
            }
        }
    }
});