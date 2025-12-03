"use client";

import { useEffect } from "react";

export default function AdSenseScript() {
  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector(
      'script[src*="adsbygoogle.js"]'
    );
    
    if (existingScript) {
      return;
    }

    // Create and append script to head
    const script = document.createElement("script");
    script.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9074463639839569";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  return null;
}
