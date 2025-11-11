export default function WhatsAppButton({ phoneNumber, message }) {
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      Chat on WhatsApp
    </a>
  );
}
