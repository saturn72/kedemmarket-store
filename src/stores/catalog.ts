import { defineStore } from 'pinia'
import type { Catalog, Product } from '@/models/catalog';
import _ from 'lodash';

type CatalogState = Catalog;

const defaultValue = {
    createdOnUtc: undefined,
    version: undefined,
    stores: [],
    products: [],
};

export const useCatalogStore = defineStore('catalog', {
    state: (): CatalogState => defaultValue,
    actions: {
        setProductStructuredDataImage(product: Product, url: string) {
            const p = this.products?.find(x => x.id == product.id);
            if (!p) {
                return;
            }
            p.structuredData.image = url;
        },
        async setCatalog(catalog: Catalog) {
            if (!catalog || catalog == null || this.$state.version == catalog.version) {
                return;
            }

            this.createdOnUtc = catalog.createdOnUtc;
            this.version = catalog.version;
            this.stores = catalog.stores;
            this.products = _.flatMap(catalog?.stores, "products");
        }
    },
    persist: {
        storage: localStorage
    }
})
