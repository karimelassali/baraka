export default function ContactOptions() {
  return (
    <div className="text-lg text-gray-700 space-y-4">
      <p>
        <strong>Email:</strong> <a href="mailto:contact@baraka.com" className="text-red-600 hover:underline">contact@baraka.com</a>
      </p>
      <p>
        <strong>Phone:</strong> <a href="tel:+1234567890" className="text-red-600 hover:underline">+1234567890</a>
      </p>
    </div>
  );
}
