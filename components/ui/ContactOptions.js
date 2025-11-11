export default function ContactOptions() {
  return (
    <div className="p-6 mt-6 text-left border w-96 rounded-xl">
      <h3 className="text-2xl font-bold">Contact Us</h3>
      <div className="mt-4 text-xl">
        <p>Phone: <a href="tel:+1234567890" className="text-blue-600">+1 234 567 890</a></p>
        <p>Email: <a href="mailto:contact@baraka.com" className="text-blue-600">contact@baraka.com</a></p>
      </div>
      <form className="mt-4">
        <div className="flex flex-col">
          <label htmlFor="name" className="mb-2 font-bold">Name</label>
          <input type="text" id="name" name="name" className="px-3 py-2 border rounded" />
        </div>
        <div className="flex flex-col mt-2">
          <label htmlFor="email" className="mb-2 font-bold">Email</label>
          <input type="email" id="email" name="email" className="px-3 py-2 border rounded" />
        </div>
        <div className="flex flex-col mt-2">
          <label htmlFor="message" className="mb-2 font-bold">Message</label>
          <textarea id="message" name="message" className="px-3 py-2 border rounded"></textarea>
        </div>
        <button type="submit" className="px-4 py-2 mt-4 font-bold text-white bg-blue-600 rounded hover:bg-blue-700">
          Send Message
        </button>
      </form>
    </div>
  );
}
