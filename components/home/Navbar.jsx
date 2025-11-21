"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TranslateWidget from "../ui/TranslateWidget";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <motion.header
            className="bg-white shadow-sm sticky top-0 z-50"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
        >
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <div className="bg-red-600 rounded-xl w-12 h-12 flex items-center justify-center text-white font-bold text-xl shadow-md">
                            B
                        </div>
                    </motion.div>
                    <motion.h1
                        className="ml-3 text-2xl font-bold text-black"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        Baraka
                    </motion.h1>
                </div>

                <nav className="hidden md:flex space-x-8">
                    {["about", "gallery", "offers", "reviews", "contact"].map(
                        (item) => (
                            <motion.a
                                key={item}
                                href={`#${item}`}
                                className="text-gray-600 hover:text-red-600 transition font-medium"
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {item.charAt(0).toUpperCase() + item.slice(1)}
                            </motion.a>
                        )
                    )}
                </nav>

                <div className="flex items-center space-x-4">
                    <div className="mr-2">
                        <TranslateWidget />
                    </div>

                    <button
                        className="md:hidden p-2 text-gray-600"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>

                    <motion.a
                        href="/auth/login"
                        className="text-gray-600 hover:text-red-600 transition hidden md:block font-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Login
                    </motion.a>

                    <motion.a
                        href="/auth/register"
                        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-5 rounded-full transition duration-300 text-sm shadow-md hover:shadow-lg hidden md:block"
                        whileHover={{
                            scale: 1.05,
                        }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Register
                    </motion.a>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex flex-col p-4 space-y-4">
                            {["about", "gallery", "offers", "reviews", "contact"].map(
                                (item) => (
                                    <motion.a
                                        key={item}
                                        href={`#${item}`}
                                        className="text-gray-600 hover:text-red-600 transition font-medium block"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {item.charAt(0).toUpperCase() + item.slice(1)}
                                    </motion.a>
                                )
                            )}
                            <div className="pt-4 border-t border-gray-100 flex flex-col space-y-3">
                                <a
                                    href="/auth/login"
                                    className="text-gray-600 hover:text-red-600 transition font-medium block"
                                >
                                    Login
                                </a>
                                <a
                                    href="/auth/register"
                                    className="bg-red-600 text-white font-medium py-2 px-4 rounded-lg text-center shadow-sm"
                                >
                                    Register
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
