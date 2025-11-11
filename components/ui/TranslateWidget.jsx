"use client";
import GoogleTranslate from "next-google-translate-widget";

export default function TranslateWidget() {
  return <GoogleTranslate pageLanguage="en" includedLanguages="ar,en,fr,it,es" />;
}
