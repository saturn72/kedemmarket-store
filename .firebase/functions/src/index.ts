import * as orders from "./orders";
import * as catalog from "./catalog";
import * as cart from "./cart";
import * as orderNotifications from "./order-notifications";
import * as token from "./token";
import * as userProfile from "./user-profile";
import * as userManagement from "./user-management";
import {initializeApp} from "firebase-admin/app";

const app = initializeApp();
orderNotifications.init(app);

export const getOrCreateCart = cart.getOrCreateCart;
export const updateCart = cart.updateCart;

export const onCatalogCreated = catalog.onCatalogCreated;

export const getOrders = orders.getOrders;
export const getOrderById = orders.getOrderById;
export const submitOrder = orders.submitOrder;

export const getUserProfile = userProfile.getUserProfile;
export const saveUserProfile = userProfile.saveUserProfile;
export const fromAnonymousUser = userProfile.fromAnonymousUser;

export const subscribeToNotifications = token.subscribeToNotifications;
// on cloud firestore update
export const onOrderUpdated = orderNotifications.onOrderUpdated;
export const onAnonymousUserDeleted = userManagement.onAnonymousUserDeleted;
