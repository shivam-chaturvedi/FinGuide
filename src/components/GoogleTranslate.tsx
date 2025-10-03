import { useEffect } from "react";

const GoogleTranslate = () => {
  useEffect(() => {
    // Define init function for Google Translate
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,zh-CN,ta,bn", // English, Chinese, Tamil, Bengali
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        "google_translate_element"
      );
    };

    // Load script dynamically (only once)
    const scriptId = "google-translate-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else {
      // If already loaded, just re-init
      if (window.google && window.google.translate) {
        window.googleTranslateElementInit();
      }
    }
  }, []);

  return <div id="google_translate_element" className="ml-2"></div>;
};

export default GoogleTranslate;
