"use client";
import GoogleTranslate from "next-google-translate-widget";

export default function TranslateWidget() {
  return (
    <GoogleTranslate pageLanguage="it" includedLanguages="ar,en,fr,it,es" />
  );
}
