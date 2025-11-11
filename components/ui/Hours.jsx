export default function Hours() {
  return (
    <ul className="text-lg text-gray-700 space-y-4">
      <li className="flex justify-between border-b border-gray-200 pb-2">
        <span>Monday - Friday:</span>
        <span className="font-semibold">9am - 5pm</span>
      </li>
      <li className="flex justify-between border-b border-gray-200 pb-2">
        <span>Saturday:</span>
        <span className="font-semibold">10am - 3pm</span>
      </li>
      <li className="flex justify-between">
        <span>Sunday:</span>
        <span className="font-semibold text-red-600">Closed</span>
      </li>
    </ul>
  );
}
