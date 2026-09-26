import { ProductType } from "@/types/types";
import { prisma } from "@/utils/connect";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const getData = async () => {
  const products = await prisma.product.findMany({
    where: { isFeatured: true },
  });

  return products.map((product) => ({
    ...product,
    img: product.img ?? undefined,
    price: product.price.toNumber(),
    options: product.options.map((option: any) => ({
      ...option,
      additionalPrice: Number(option.additionalPrice),
    })),
  }));
};

const Featured = async () => {
  const featuredProducts: ProductType[] = await getData();

  return (
    <div className="w-screen overflow-x-scroll text-red-500">
      {/* WRAPPER */}
      <div className="w-max flex">
        {/* SINGLE ITEM */}
        {featuredProducts.map((item) => (
          <Link
            href={`/product/${item.id}`}
            key={item.id}
            className="w-screen h-[60vh] flex flex-col items-center justify-around p-4 cursor-pointer hover:bg-fuchsia-50 transition-all duration-300 md:w-[50vw] xl:w-[33vw] xl:h-[90vh]"
          >
            {/* IMAGE CONTAINER */}
            {item.img && (
              <div className="relative flex-1 w-full hover:rotate-[60deg] transition-all duration-500">
                <Image src={item.img} alt="" fill className="object-contain" />
              </div>
            )}
            {/* TEXT CONTAINER */}
            <div className=" flex-1 flex flex-col items-center justify-center text-center gap-4">
              <h1 className="text-xl font-bold uppercase xl:text-2xl 2xl:text-3xl">
                {item.title}
              </h1>
              <p className="p-4 2xl:p-8">{item.desc}</p>
              <span className="text-xl font-bold">${item.price}</span>
              <span className="bg-red-500 text-white p-2 rounded-md">
                Add to Cart
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Featured;
