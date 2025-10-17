import { useEffect, useState } from "react";
import { Volume2, Languages } from "lucide-react";

// Type declarations for Google Translate
declare global {
  interface Window {
    google: {
      translate: {
        TranslateElement: {
          new (options: any, elementId: string): any;
          InlineLayout: {
            SIMPLE: number;
            HORIZONTAL: number;
            VERTICAL: number;
          };
        };
      };
    };
    googleTranslateElementInit: () => void;
  }
}

const GoogleTranslate = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const scriptId = "google-translate-script";

    // Define init function globally before script runs
    window.googleTranslateElementInit = function () {
      if (document.getElementById("google_translate_element") && window.google && window.google.translate) {
        try {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,zh-CN,ta,bn", // English, Tamil, Chinese (Simplified), Bengali
              layout: window.google.translate.TranslateElement.InlineLayout?.SIMPLE || 0,
            autoDisplay: false,
            multilanguagePage: true,
          },
          "google_translate_element"
        );
        setIsLoaded(true);
          
          // Apply custom styling after Google Translate loads
          setTimeout(() => {
            applyCustomStyles();
          }, 200);
        } catch (error) {
          console.error('Google Translate initialization error:', error);
          setIsLoaded(false);
        }
      }
    };

    // Function to apply custom styling to Google Translate elements
    const applyCustomStyles = () => {
      const translateElement = document.getElementById("google_translate_element");
      if (!translateElement) return;

      // Check if dark mode is active
      const isDarkMode = document.documentElement.classList.contains('dark') || 
                        document.documentElement.getAttribute('data-theme') === 'dark' ||
                        window.matchMedia('(prefers-color-scheme: dark)').matches;

      // Create style element if it doesn't exist
      let styleElement = document.getElementById('google-translate-custom-styles');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'google-translate-custom-styles';
        document.head.appendChild(styleElement);
      }

      // Apply theme-specific styles
      const styles = isDarkMode ? `
        .goog-te-banner-frame {
          display: none !important;
        }
        
        /* Main container styling */
        .goog-te-gadget {
          color: #f8fafc !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
        
        /* Dropdown select styling */
        .goog-te-gadget .goog-te-combo {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
          color: #f8fafc !important;
          border: 2px solid #3b82f6 !important;
          border-radius: 12px !important;
          padding: 10px 16px !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          min-width: 180px !important;
          max-width: 220px !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2) !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          cursor: pointer !important;
        }
        
        .goog-te-gadget .goog-te-combo:hover {
          border-color: #60a5fa !important;
          box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.4), 0 4px 6px -1px rgba(0, 0, 0, 0.3) !important;
          transform: translateY(-1px) !important;
        }
        
        .goog-te-gadget .goog-te-combo:focus {
          outline: none !important;
          border-color: #60a5fa !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3), 0 6px 8px -1px rgba(0, 0, 0, 0.4) !important;
          transform: translateY(-1px) !important;
        }
        
        /* Dropdown options styling */
        .goog-te-gadget .goog-te-combo option {
          background-color: #1e293b !important;
          color: #f8fafc !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          padding: 8px 12px !important;
          border: none !important;
        }
        
        .goog-te-gadget .goog-te-combo option:hover {
          background-color: #334155 !important;
        }
        
        /* Simple layout styling */
        .goog-te-gadget-simple {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.9) 100%) !important;
          border: 2px solid #3b82f6 !important;
          border-radius: 12px !important;
          padding: 8px 12px !important;
          backdrop-filter: blur(10px) !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2) !important;
        }
        
        .goog-te-gadget-simple .goog-te-menu-value {
          color: #f8fafc !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          background: transparent !important;
          padding: 0 !important;
          border: none !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }
        
        .goog-te-gadget-simple .goog-te-menu-value span:first-child {
          color: #f8fafc !important;
          font-size: 14px !important;
          font-weight: 600 !important;
        }
        
        .goog-te-gadget-simple .goog-te-menu-value span:last-child {
          color: #94a3b8 !important;
          font-size: 12px !important;
          font-weight: 500 !important;
        }
        
        .goog-te-gadget-simple .goog-te-menu-value:before {
          content: "🌐 " !important;
          color: #3b82f6 !important;
          font-weight: bold !important;
          font-size: 16px !important;
          margin-right: 4px !important;
        }
        
        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .goog-te-gadget .goog-te-combo {
            min-width: 120px !important;
            max-width: 150px !important;
            font-size: 12px !important;
            padding: 6px 8px !important;
          }
          .goog-te-gadget {
            font-size: 12px !important;
          }
          .goog-te-gadget-simple {
            padding: 4px 6px !important;
            min-width: 100px !important;
            max-width: 140px !important;
          }
          .goog-te-gadget-simple .goog-te-menu-value {
            font-size: 12px !important;
          }
          .goog-te-gadget-simple .goog-te-menu-value:before {
            font-size: 12px !important;
            margin-right: 2px !important;
          }
        }
        
        @media (max-width: 480px) {
          .goog-te-gadget .goog-te-combo {
            min-width: 100px !important;
            max-width: 130px !important;
            font-size: 11px !important;
            padding: 4px 6px !important;
          }
          .goog-te-gadget {
            font-size: 11px !important;
          }
          .goog-te-gadget-simple {
            padding: 3px 5px !important;
            min-width: 80px !important;
            max-width: 120px !important;
          }
          .goog-te-gadget-simple .goog-te-menu-value {
            font-size: 11px !important;
          }
          .goog-te-gadget-simple .goog-te-menu-value:before {
            font-size: 11px !important;
            margin-right: 1px !important;
          }
        }
      ` : `
        .goog-te-banner-frame {
          display: none !important;
        }
        
        /* Main container styling */
        .goog-te-gadget {
          color: #1e293b !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
        
        /* Dropdown select styling */
        .goog-te-gadget .goog-te-combo {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
          color: #1e293b !important;
          border: 2px solid #3b82f6 !important;
          border-radius: 12px !important;
          padding: 10px 16px !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          min-width: 180px !important;
          max-width: 220px !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          cursor: pointer !important;
        }
        
        .goog-te-gadget .goog-te-combo:hover {
          border-color: #60a5fa !important;
          box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.15), 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
          transform: translateY(-1px) !important;
        }
        
        .goog-te-gadget .goog-te-combo:focus {
          outline: none !important;
          border-color: #60a5fa !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2), 0 6px 8px -1px rgba(0, 0, 0, 0.15) !important;
          transform: translateY(-1px) !important;
        }
        
        /* Dropdown options styling */
        .goog-te-gadget .goog-te-combo option {
          background-color: #ffffff !important;
          color: #1e293b !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          padding: 8px 12px !important;
          border: none !important;
        }
        
        .goog-te-gadget .goog-te-combo option:hover {
          background-color: #f1f5f9 !important;
        }
        
        /* Simple layout styling */
        .goog-te-gadget-simple {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%) !important;
          border: 2px solid #3b82f6 !important;
          border-radius: 12px !important;
          padding: 8px 12px !important;
          backdrop-filter: blur(10px) !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        }
        
        .goog-te-gadget-simple .goog-te-menu-value {
          color: #1e293b !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          background: transparent !important;
          padding: 0 !important;
          border: none !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }
        
        .goog-te-gadget-simple .goog-te-menu-value span:first-child {
          color: #1e293b !important;
          font-size: 14px !important;
          font-weight: 600 !important;
        }
        
        .goog-te-gadget-simple .goog-te-menu-value span:last-child {
          color: #64748b !important;
          font-size: 12px !important;
          font-weight: 500 !important;
        }
        
        .goog-te-gadget-simple .goog-te-menu-value:before {
          content: "🌐 " !important;
          color: #3b82f6 !important;
          font-weight: bold !important;
          font-size: 16px !important;
          margin-right: 4px !important;
        }
        
        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .goog-te-gadget .goog-te-combo {
            min-width: 120px !important;
            max-width: 150px !important;
            font-size: 12px !important;
            padding: 6px 8px !important;
          }
          .goog-te-gadget {
            font-size: 12px !important;
          }
          .goog-te-gadget-simple {
            padding: 4px 6px !important;
            min-width: 100px !important;
            max-width: 140px !important;
          }
          .goog-te-gadget-simple .goog-te-menu-value {
            font-size: 12px !important;
          }
          .goog-te-gadget-simple .goog-te-menu-value:before {
            font-size: 12px !important;
            margin-right: 2px !important;
          }
        }
        
        @media (max-width: 480px) {
          .goog-te-gadget .goog-te-combo {
            min-width: 100px !important;
            max-width: 130px !important;
            font-size: 11px !important;
            padding: 4px 6px !important;
          }
          .goog-te-gadget {
            font-size: 11px !important;
          }
          .goog-te-gadget-simple {
            padding: 3px 5px !important;
            min-width: 80px !important;
            max-width: 120px !important;
          }
          .goog-te-gadget-simple .goog-te-menu-value {
            font-size: 11px !important;
          }
          .goog-te-gadget-simple .goog-te-menu-value:before {
            font-size: 11px !important;
            margin-right: 1px !important;
          }
        }
      `;

      styleElement.textContent = styles;
    };

    // Only add script if not already added
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      script.defer = true;

      // Wait for window to be ready — helps on mobile
      script.onload = () => {
        // Add a small delay to ensure Google Translate is fully loaded
        setTimeout(() => {
          if (window.google && window.google.translate && window.google.translate.TranslateElement) {
          window.googleTranslateElementInit();
          } else {
            console.error('Google Translate not fully loaded');
            setIsLoaded(false);
        }
        }, 100);
      };

      document.body.appendChild(script);
    } else if (window.google && window.google.translate) {
      window.googleTranslateElementInit();
    }

    // Re-initialize on window resize (mobile rotates or resizes)
    const handleResize = () => {
      if (window.google && window.google.translate) {
        window.googleTranslateElementInit();
      }
    };

    // Listen for theme changes
    const handleThemeChange = () => {
      setTimeout(() => {
        applyCustomStyles();
      }, 100);
    };

    // Listen for theme changes using MutationObserver
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'class' || mutation.attributeName === 'data-theme')) {
          handleThemeChange();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="absolute top-20 md:top-28 right-2 sm:right-4 md:right-8 z-50 google-translate-container">
      <div className="flex items-center gap-2 sm:gap-3 bg-transparent dark:bg-slate-800/90 backdrop-blur-md rounded-xl shadow-lg border border-blue-200/50 dark:border-blue-400/50 max-w-[calc(100vw-1rem)] sm:max-w-none">
        {/* <div className="flex items-center gap-1 sm:gap-2">
        </div> */}
        <div
          id="google_translate_element"
          className="translate-widget"
          style={{
            minHeight: "20px",
            overflow: "visible",
            zIndex: 9999,
            maxWidth: "calc(100vw - 120px)",
          }}
        ></div>
      </div>
    </div>
  );
};

export { GoogleTranslate };
export default GoogleTranslate;
