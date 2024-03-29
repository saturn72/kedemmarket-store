import type { Product, Vendor } from "@/models/catalog";
import { getMediaItemOrDefault } from "@/services/media";

const acquireVendor = async (key: string): Promise<Vendor | undefined | null> => {
    const url = await useNuxtApp().$storage.getDownloadUrl(`catalog/${key}.json`);
    if (!url) {
        return undefined;
    }
    const v = await $fetch<any>(url);

    const products: Product[] = [];
    if (v.products) {
        for (let index = 0; index < v.products.length; index++) {
            const p = v.products[index];

            const tn = p.media?.find((m: any) => m.type == "thumbs") ||
                p.media?.find((m: any) => m.displayOrder == 0);

            const media = await getMediaItemOrDefault(
                tn,
                "thumbnail",
                {
                    alt: p.name,
                    src: useAppConfig().defaults.thumbnail,
                    title: p.name,

                });

            const vp: Product = {
                ...p
            };

            vp.tierPrices = p.tierPrices.sort((a: { quantity: number }, b: { quantity: number }) => a.quantity - b.quantity);
            vp.media = [media];
            products.push(vp);
        }
    }
    const logo = await getMediaItemOrDefault(
        v.logo?.uri,
        "thumbnail",
        {
            alt: v.name,
            src: useAppConfig().defaults.thumbnail,
            title: v.name,

        });

    return {
        id: v.id,
        name: v.name,
        logo,
        store: {
            id: v.store.id,
            name: v.store.name,
        },
        products,
    };
}

export async function getVendorByRoute(route: string): Promise<Vendor | null | undefined> {
    return await useNuxtApp().$sessionCache.getOrAcquire(
        `catalog:vendor:${route}`,
        () => acquireVendor(route), 10 * 60);

}