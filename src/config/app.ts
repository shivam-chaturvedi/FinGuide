export const APP_CONFIG = {
    name: "FinGuide SG",
    shortName: "FinGuide",
    description: "Empowering Migrant Workers in Singapore with Financial Knowledge",
    tagline: "Learn, Save, and Send Money Safely",
    version: "1.0.0",
    author: "FinGuide Team",
    url: "https://finguide.sg",

    // Brand colors
    colors: {
        primary: "Trust Blue",
        secondary: "Growth Green",
        accent: "Singapore Gold"
    },

    // Features
    features: [
        "Financial Literacy Modules",
        "Budget & Savings Calculators",
        "Safe Remittance Tools",
        "Multi-language Support",
        "Singapore-Specific Content"
    ],

    // Target audience
    targetAudience: "Migrant Workers in Singapore",

    // Supported countries
    supportedCountries: [
        "India", "Philippines", "China", "Bangladesh",
        "Myanmar", "Thailand", "Vietnam"
    ]
} as const;

export type AppConfig = typeof APP_CONFIG;
