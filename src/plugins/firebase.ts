import { FirebaseApp, initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { connectFunctionsEmulator, getFunctions, httpsCallable } from "firebase/functions";
import { useUserStore } from "@/stores/user";

export default defineNuxtPlugin((nuxtApp) => {
    const app: FirebaseApp = initializeApp(useAppConfig().firebase);
    const auth = getAuth(app);
    auth.useDeviceLanguage();
    auth.currentUser;

    auth.onAuthStateChanged(user => {
        if (user) {
            useUserStore().setUser(user);
        }
        else {
            useUserStore().$reset();
        }
    });

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

            backend: {
                async placeOrder(cart: []): Promise<any> {
                    const functions = getFunctions();

                    if (process.env.NODE_ENV != 'production') {
                        connectFunctionsEmulator(functions, "127.0.0.1", 5001);
                    }

                    const po = httpsCallable(functions, 'addOrder');
                    return await po(cart);
                },
                updateCart() {
                    // const functions = getFunctions(app);
                    // connectFunctionsEmulator(functions, "127.0.0.1", 5001)
                    console.log("this should ineract with  cart update cloud function");
                }
            }
        }
    }
});