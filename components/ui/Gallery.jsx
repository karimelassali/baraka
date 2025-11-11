import Image from "next/image";

export default function Gallery() {
  const images = [
    "/next.svg",
    "/vercel.svg",
    "/file.svg",
    "/globe.svg",
    "/window.svg",
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((src, index) => (
        <div key={index} className="overflow-hidden rounded-lg shadow-lg transform hover:scale-105 transition duration-300">
          <Image src={src} alt={`Gallery image ${index + 1}`} width={400} height={400} className="object-cover w-full h-full" />
        </div>
      ))}
    </div>
  );
}
