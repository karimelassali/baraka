import { NextResponse } from "next/server";

export async function GET() {
  const offers = {
    weekly: [
      { id: 1, title: "20% off on all pastries this week!" },
      { id: 2, title: "Buy one coffee, get one free" },
    ],
    permanent: [
      { id: 3, title: "Student discount: 10% off" },
      { id: 4, title: "Happy hour: 5-7 PM" },
    ],
  };
  return NextResponse.json(offers);
}
