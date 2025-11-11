import Image from "next/image";

const images = [
  "/next.svg",
  "/vercel.svg",
  "/file.svg",
  "/globe.svg",
  "/window.svg",
];

export default function Gallery() {
  return (
    <div className="flex flex-wrap items-center justify-center">
      {images.map((src, index) => (
        <div key={index} className="w-1/3 p-4">
          <Image
            src={src}
            alt={`Gallery image ${index + 1}`}
            width={200}
            height={200}
            className="object-cover w-full h-full"
          />
        </div>
      ))}
    </div>
  );
}
