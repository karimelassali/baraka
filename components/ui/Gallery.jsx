import Image from "next/image";

export default function Gallery() {
  return (
    <div>
      <h3>Our Gallery</h3>
      <div style={{ display: "flex", gap: "10px" }}>
        <Image src="/next.svg" alt="Next.js Logo" width={100} height={100} />
        <Image src="/vercel.svg" alt="Vercel Logo" width={100} height={100} />
      </div>
    </div>
  );
}
