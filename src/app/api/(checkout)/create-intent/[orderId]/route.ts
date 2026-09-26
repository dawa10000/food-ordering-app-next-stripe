import { prisma } from "@/utils/connect";
import { NextRequest, NextResponse } from "next/server";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params;

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (order) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(Number(order.price) * 100),
        currency: "usd",
        payment_method_types: ["card"],
      });

      await prisma.order.update({
        where: {
          id: orderId,
        },
        data: { intent_id: paymentIntent.id },
      });

      return new NextResponse(
        JSON.stringify({ clientSecret: paymentIntent.client_secret }),
        { status: 200 }
      );
    } catch (err) {
      console.log(err);
      return new NextResponse(
        JSON.stringify({ message: "Something went wrong!" }),
        { status: 500 }
      );
    }
  }

  return new NextResponse(
    JSON.stringify({ message: "Order not found!" }),
    { status: 404 }
  );
}