export default function WhatsAppButton({ phoneNumber, message }) {
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white font-bold py-3 px-6 rounded-full hover:bg-green-600 transition duration-300 shadow-md">
      Chat on WhatsApp
    </a>
  );
}
