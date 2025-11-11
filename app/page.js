import Image from "next/image";
import Gallery from "../components/ui/Gallery";
import Hours from "../components/ui/Hours";
import WhatsAppButton from "../components/ui/WhatsAppButton";
import ContactOptions from "../components/ui/ContactOptions";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to{" "}
          <a className="text-blue-600" href="#">
            Baraka
          </a>
        </h1>

        <p className="mt-3 text-2xl">
          Your one-stop shop for the best products.
        </p>

        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
          <Gallery />
          <Hours />
          <ContactOptions />
        </div>
        <div className="mt-6">
          <WhatsAppButton phoneNumber="+1234567890" message="Hello Baraka!" />
        </div>
      </main>

      <footer className="flex items-center justify-center w-full h-24 border-t">
        <a
          className="flex items-center justify-center"
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} className="h-4 ml-2" />
        </a>
      </footer>
    </div>
  );
}
