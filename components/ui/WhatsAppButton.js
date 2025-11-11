import Image from "next/image";

export default function WhatsAppButton({ phoneNumber, message }) {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-500 border border-transparent rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
    >
      <Image
        src="/whatsapp.svg" // Assuming you have a whatsapp icon in public folder
        alt="WhatsApp Logo"
        width={20}
        height={20}
        className="mr-2"
      />
      Chat on WhatsApp
    </a>
  );
}
