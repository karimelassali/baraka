import { NextResponse } from "next/server";

export async function GET() {
  const reviews = [
    { id: 1, author: "John Doe", text: "Great coffee and atmosphere!" },
    { id: 2, author: "Jane Smith", text: "I love the pastries here." },
    { id: 3, author: "Peter Jones", text: "A bit crowded, but worth it." },
  ];
  return NextResponse.json(reviews);
}
