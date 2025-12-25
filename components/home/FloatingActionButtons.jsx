"use client";

import { motion } from "framer-motion";
import { MessageCircle, Map, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function FloatingActionButtons() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToGallery = (e) => {
        e.preventDefault();
        const gallerySection = document.getElementById('gallery');
        if (gallerySection) {
            gallerySection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const buttons = [
        {
            icon: (
                <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-6 h-6">
                    <defs>
                        <linearGradient id="linear-gradient" x1="1337.28" y1="518.24" x2="1337.28" y2="-2164.82" gradientTransform="matrix(0.19, 0, 0, -0.19, 0.81, 98.89)" gradientUnits="userSpaceOnUse">
                            <stop offset="0" stopColor="#61fd7d" />
                            <stop offset="1" stopColor="#2bb826" />
                        </linearGradient>
                    </defs>
                    <title>wa</title>
                    <path fill="url(#linear-gradient)" d="M512,382.07c0,2.8-.09,8.88-.26,13.58-.41,11.49-1.32,26.32-2.7,33.07a109.76,109.76,0,0,1-9.27,27.71,98.45,98.45,0,0,1-43.43,43.39,110.21,110.21,0,0,1-27.87,9.28c-6.69,1.35-21.41,2.24-32.82,2.65-4.71.17-10.79.25-13.58.25l-252.1,0c-2.8,0-8.88-.09-13.58-.26-11.49-.41-26.32-1.32-33.07-2.69a110.37,110.37,0,0,1-27.72-9.28A98.5,98.5,0,0,1,12.18,456.3,110.21,110.21,0,0,1,2.9,428.43C1.55,421.74.66,407,.25,395.61.08,390.91,0,384.82,0,382l0-252.1c0-2.8.09-8.88.25-13.58C.71,104.86,1.62,90,3,83.28a110.37,110.37,0,0,1,9.27-27.72A98.59,98.59,0,0,1,55.7,12.18,110.21,110.21,0,0,1,83.57,2.9C90.26,1.55,105,.66,116.39.25,121.09.08,127.18,0,130,0l252.1,0c2.8,0,8.88.09,13.58.25C407.14.71,422,1.62,428.72,3a110.37,110.37,0,0,1,27.72,9.27A98.59,98.59,0,0,1,499.82,55.7a110.21,110.21,0,0,1,9.28,27.87c1.35,6.69,2.24,21.41,2.65,32.82.17,4.7.25,10.79.25,13.58Z" />
                    <path fill="#fff" d="M379.56,131.67A172.4,172.4,0,0,0,256.67,80.73C161,80.73,83.05,158.64,83.05,254.42a173.47,173.47,0,0,0,23.2,86.82l-24.65,90,92.08-24.17a173.55,173.55,0,0,0,83,21.17h.07c95.73,0,173.69-77.91,173.69-173.69A172.73,172.73,0,0,0,379.53,131.7l0,0ZM256.72,399a144.17,144.17,0,0,1-73.52-20.14l-5.29-3.15L123.27,390l14.59-53.27-3.42-5.47a143.29,143.29,0,0,1-22.11-76.81C112.33,174.81,177.1,110,256.8,110A144.34,144.34,0,0,1,401.12,254.48c-.07,79.67-64.83,144.46-144.41,144.46v0ZM335.87,290.8c-4.32-2.2-25.68-12.67-29.65-14.12s-6.85-2.19-9.8,2.2-11.22,14.11-13.76,17-5.06,3.29-9.37,1.09-18.35-6.77-34.92-21.56c-12.88-11.5-21.61-25.74-24.15-30s-.29-6.71,1.92-8.83c2-1.93,4.32-5.06,6.51-7.6s2.88-4.32,4.32-7.26.74-5.42-.35-7.6-9.8-23.55-13.34-32.25c-3.49-8.51-7.12-7.32-9.79-7.47s-5.42-.13-8.29-.13a16,16,0,0,0-11.57,5.41c-4,4.32-15.2,14.86-15.2,36.22s15.54,42,17.72,44.91,30.61,46.76,74.14,65.54c10.34,4.44,18.42,7.11,24.72,9.18a60,60,0,0,0,27.32,1.71c8.35-1.23,25.68-10.49,29.31-20.62s3.63-18.83,2.55-20.62-3.91-3-8.29-5.22l0,0Z" />
                </svg>
            ),
            label: "WhatsApp",
            href: "https://wa.me/1234567890", // Using the number from contact section
            color: "bg-white hover:bg-gray-100", // Changed to white as logo has its own color
            onClick: null
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 232597 333333" className="w-6 h-6">
                    <path d="M151444 5419C140355 1916 128560 0 116311 0 80573 0 48591 16155 27269 41534l54942 46222 69232-82338z" fill="#1a73e8" />
                    <path d="M27244 41534C10257 61747 0 87832 0 116286c0 21876 4360 39594 11517 55472l70669-84002-54942-46222z" fill="#ea4335" />
                    <path d="M116311 71828c24573 0 44483 19910 44483 44483 0 10938-3957 20969-10509 28706 0 0 35133-41786 69232-82313-14089-27093-38510-47936-68048-57286L82186 87756c8166-9753 20415-15928 34125-15928z" fill="#4285f4" />
                    <path d="M116311 160769c-24573 0-44483-19910-44483-44483 0-10863 3906-20818 10358-28555l-70669 84027c12072 26791 32159 48289 52851 75381l85891-102122c-8141 9628-20339 15752-33948 15752z" fill="#fbbc04" />
                    <path d="M148571 275014c38787-60663 84026-88210 84026-158728 0-19331-4738-37552-13080-53581L64393 247140c6578 8620 13206 17793 19683 27900 23590 36444 17037 58294 32260 58294 15172 0 8644-21876 32235-58320z" fill="#34a853" />
                </svg>
            ),
            label: "Maps",
            href: "https://maps.app.goo.gl/3C6QCM",
            color: "bg-white hover:bg-gray-100", // Changed to white as logo has its own color
            onClick: null
        },
    ];

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 ltr:right-6 rtl:left-6 z-50 flex flex-col gap-3">
            {buttons.map((btn, index) => (
                <motion.a
                    key={index}
                    href={btn.href}
                    onClick={btn.onClick || undefined}
                    target={btn.href.startsWith('http') ? "_blank" : "_self"}
                    rel={btn.href.startsWith('http') ? "noopener noreferrer" : ""}
                    className={`${btn.color} text-white p-3 rounded-full shadow-lg flex items-center justify-center transition-colors relative group w-12 h-12 flex-none`}
                    initial={{ opacity: 0, scale: 0, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0, y: 20 }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 260, damping: 20 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={btn.label}
                >
                    {btn.icon}
                    <span className="absolute ltr:right-full ltr:mr-3 rtl:left-full rtl:ml-3 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {btn.label}
                    </span>
                </motion.a>
            ))}
        </div>
    );
}
