import { ActionTypes, CartItemType, CartType } from "@/types/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const INITIAL_STATE = {
  products: [],
  totalItems: 0,
  totalPrice: 0,
};

const normalizeProducts = (products: CartItemType[]) =>
  products
    .filter(
      (product) =>
        Number.isFinite(Number(product.quantity)) &&
        Number(product.quantity) > 0 &&
        Number.isFinite(Number(product.price)) &&
        Number(product.price) >= 0
    )
    .map((product) => ({
      ...product,
      quantity: Number(product.quantity),
      price: Number(product.price),
    }));

const getTotals = (products: CartItemType[]) => ({
  totalItems: products.reduce((total, product) => total + product.quantity, 0),
  totalPrice: Math.round(
    (products.reduce((total, product) => total + product.price, 0) +
      Number.EPSILON) *
      100
  ) / 100,
});

export const useCartStore = create(
  persist<CartType & ActionTypes>(
    (set, get) => ({
      products: INITIAL_STATE.products,
      totalItems: INITIAL_STATE.totalItems,
      totalPrice: INITIAL_STATE.totalPrice,
      addToCart(item) {
        const quantity = Number(item.quantity);
        const price = Number(item.price);
        if (
          !Number.isFinite(quantity) ||
          quantity <= 0 ||
          !Number.isFinite(price) ||
          price < 0
        ) {
          return;
        }

        const products = get().products;
        const productInState = products.find(
          (product) =>
            product.id === item.id &&
            product.optionTitle === item.optionTitle
        );

        if (productInState) {
          const updatedProducts = products.map((product) =>
            product.id === productInState.id &&
              product.optionTitle === item.optionTitle
              ? {
                ...product,
                quantity: Number(product.quantity) + quantity,
                price: Number(product.price) + price,
              }
              : product
          );
          set({ products: updatedProducts, ...getTotals(updatedProducts) });
        } else {
          const updatedProducts = [
            ...products,
            { ...item, price, quantity },
          ];
          set({ products: updatedProducts, ...getTotals(updatedProducts) });
        }
      },
      removeFromCart(item) {
        set((state) => {
          const exists = state.products.some(
            (product) =>
              product.id === item.id &&
              product.optionTitle === item.optionTitle
          );
          if (!exists) return state;

          const products = state.products.filter(
            (product) =>
              !(
                product.id === item.id &&
                product.optionTitle === item.optionTitle
              )
          );
          return { products, ...getTotals(products) };
        });
      },
    }),
    {
      name: "cart",
      skipHydration: true,
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<CartType> | undefined;
        const persistedProducts = persisted?.products;
        const products = normalizeProducts(
          Array.isArray(persistedProducts) ? persistedProducts : []
        );
        return { ...currentState, products, ...getTotals(products) };
      },
    }
  )
);