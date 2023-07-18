import { FirebaseApp, initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";

export default defineNuxtPlugin((nuxtApp) => {
    const app: FirebaseApp = initializeApp(useAppConfig().firebase);

    return {
        provide: {
            getApp() {
                return app
            },
            storage: {
                getDownloadUrl: async (uri: string): Promise<string | null> => {
                    while (uri.startsWith('/')) {
                        uri = uri.substring(1);
                    }

                    try {
                        const s = getStorage(app);
                        const r = ref(s, uri);
                        return await getDownloadURL(r);
                    } catch {
                        return null;
                    }
                }
            },
            user: () => getAuth(app).currentUser,
            backend: {
                placeOrder(orderCarts: []) {

                    console.log("this is place order");
                    console.log(orderCarts);
                },
                updateCart() {
                    // const functions = getFunctions(app);
                    // connectFunctionsEmulator(functions, "127.0.0.1", 5001)
                    console.log("this is cart update cloud function");
                }
            }
        }
    }
});