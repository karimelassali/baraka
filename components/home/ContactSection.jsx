"use client";

import { motion } from "framer-motion";
import ContactOptions from "../ui/ContactOptions";
import Hours from "../ui/Hours";

export default function ContactSection() {
    const businessInfo = {
        address: "Via Salvador Allende, 4, 29015 Castel San Giovanni PC, Italy",
        mapLink: "https://maps.app.goo.gl/3C6QCM",
    };

    return (
        <section id="contact" className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="bg-red-50 rounded-3xl p-8 md:p-12 shadow-sm">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <motion.h2
                                className="text-3xl md:text-4xl font-bold text-black mb-4"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                Visit Our Store
                            </motion.h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                We are conveniently located in Castel San Giovanni. Come visit us and experience our quality service firsthand.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <h3 className="text-2xl font-bold text-black mb-6">
                                    Contact Information
                                </h3>

                                <div className="bg-white p-8 rounded-2xl shadow-sm mb-8">
                                    <ContactOptions />
                                </div>

                                <div className="mb-8">
                                    <h4 className="font-bold text-lg mb-3">Address</h4>
                                    <p className="text-gray-700 mb-3">{businessInfo.address}</p>
                                    <a
                                        href={businessInfo.mapLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-red-600 hover:text-red-800 font-medium"
                                    >
                                        Open in Google Maps
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 ml-1"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </a>
                                </div>

                                <div>
                                    <h4 className="font-bold text-lg mb-4">Opening Hours</h4>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                                        <Hours />
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="h-full min-h-[400px] rounded-2xl overflow-hidden shadow-lg relative"
                            >
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2810.663847800613!2d9.4333!3d45.0583!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4781256666666667%3A0x0!2sVia%20Salvador%20Allende%2C%204%2C%2029015%20Castel%20San%20Giovanni%20PC!5e0!3m2!1sen!2sit!4v1620000000000!5m2!1sen!2sit"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0, position: 'absolute', top: 0, left: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    title="Baraka Location"
                                ></iframe>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
