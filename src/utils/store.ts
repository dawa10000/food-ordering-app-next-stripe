import { ActionTypes, CartType } from "@/types/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const INITIAL_STATE = {
  products: [],
  totalItems: 0,
  totalPrice: 0,
};

export const useCartStore = create(
  persist<CartType & ActionTypes>(
    (set, get) => ({
      products: INITIAL_STATE.products,
      totalItems: INITIAL_STATE.totalItems,
      totalPrice: INITIAL_STATE.totalPrice,
      addToCart(item) {
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
                quantity: Number(product.quantity) + Number(item.quantity),
                price: Number(product.price) + Number(item.price),
              }
              : product
          );
          set((state) => ({
            products: updatedProducts,
            totalItems: Number(state.totalItems) + Number(item.quantity),
            totalPrice: Number(state.totalPrice) + Number(item.price),
          }));
        } else {
          set((state) => ({
            products: [
              ...state.products,
              { ...item, price: Number(item.price) },
            ],
            totalItems: Number(state.totalItems) + Number(item.quantity),
            totalPrice: Number(state.totalPrice) + Number(item.price),
          }));
        }
      },
      removeFromCart(item) {
        set((state) => ({
          products: state.products.filter(
            (product) =>
              !(
                product.id === item.id &&
                product.optionTitle === item.optionTitle
              )
          ),
          totalItems: Number(state.totalItems) - Number(item.quantity),
          totalPrice: Number(state.totalPrice) - Number(item.price),
        }));
      },
    }),
    { name: "cart", skipHydration: true }
  )
);