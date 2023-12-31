import { defineStore } from 'pinia'
import type { Vendor } from '@/models/catalog';
import { useRoute } from 'vue-router'
import { getVendorByRoute } from "@/services/vendor";


type VendorState = {
    vendor?: Vendor | undefined,
    route?: string
}

export const useVendorStore = defineStore('vendor', {
    state: (): VendorState => { return { vendor: undefined } },
    actions: {
        async setVendor(): Promise<void> {
            const params = useRoute().params;
            const route = `${params.storeId}/${params.vendor}`;
            this.route = '/' + route;
            const data = await getVendorByRoute(route);
            if (data) {
                this.vendor = data;
            };
        },
    },
});
