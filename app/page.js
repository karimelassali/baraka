import Image from "next/image";
import Gallery from "../components/ui/Gallery";
import Hours from "../components/ui/Hours";
import WhatsAppButton from "../components/ui/WhatsAppButton";
import ContactOptions from "../components/ui/ContactOptions";

export default function Home() {
  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* Navbar */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center p-4">
          <h1 className="text-3xl font-bold text-red-600">Baraka</h1>
          <nav className="space-x-6 flex items-center">
            <a href="#gallery" className="text-gray-600 hover:text-red-600 transition">Gallery</a>
            <a href="#hours" className="text-gray-600 hover:text-red-600 transition">Hours</a>
            <a href="#contact" className="text-gray-600 hover:text-red-600 transition">Contact</a>
            <a href="/offers" className="text-gray-600 hover:text-red-600 transition">Offers</a>
            <a href="/reviews" className="text-gray-600 hover:text-red-600 transition">Reviews</a>
            <a href="/login" className="text-gray-600 hover:text-red-600 transition">Login</a>
            <a href="/register" className="bg-red-600 text-white font-bold py-2 px-4 rounded-full hover:bg-red-700 transition duration-300">Register</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[60vh] bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/1600/900')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-6xl font-bold">Welcome to Baraka</h2>
            <p className="text-2xl mt-4">Your one-stop shop for the best products.</p>
            <a href="#contact" className="mt-8 inline-block bg-red-600 text-white font-bold py-3 px-8 rounded-full hover:bg-red-700 transition duration-300">
              Get in Touch
            </a>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto p-8 md:p-12">
        {/* Gallery Section */}
        <section id="gallery" className="py-16">
          <h3 className="text-4xl font-bold text-center mb-12">Our Gallery</h3>
          <Gallery />
        </section>

        {/* Hours & Contact Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 py-16">
          <section id="hours">
            <h3 className="text-4xl font-bold text-center mb-12">Opening Hours</h3>
            <div className="bg-gray-50 p-8 rounded-xl shadow-lg">
              <Hours />
            </div>
          </section>

          <section id="contact">
            <h3 className="text-4xl font-bold text-center mb-12">Contact Us</h3>
            <div className="bg-gray-50 p-8 rounded-xl shadow-lg">
              <ContactOptions />
              <div className="mt-8 text-center">
                <WhatsAppButton phoneNumber="+1234567890" message="Hello Baraka!" />
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      
      <footer className="bg-gray-900 text-white p-8">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} Baraka. All rights reserved.</p>
          <div className="mt-4 space-x-4">
            <a href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</a>
            <a href="/cookies" className="text-gray-400 hover:text-white">Cookie Policy</a>
            <a href="/terms" className="text-gray-400 hover:text-white">Terms & Conditions</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
