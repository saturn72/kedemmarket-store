import { useUserStore } from "@/stores/user";

const excludedPaths: string[] = ['/login', '/product'];

export default defineNuxtRouteMiddleware(async (to, from) => {
    const t = to.fullPath
    const skipAuth = t.length == 0 ||
        t == '/' ||
        excludedPaths.some(x => t.toLowerCase().startsWith(x));

    if (!skipAuth) {
        const user = useUserStore().user;
        const shouldLogin = !user || user == null || user.isAnonymous;

        if (shouldLogin) {
            return navigateTo(`${useAppConfig().routes.login}?returnUrl=${to.fullPath}`);
        }
    } else {
        await useAlertStore().setAppLoaderByCondition(
            () => useUserStore().getUser == undefined);

    }
})
