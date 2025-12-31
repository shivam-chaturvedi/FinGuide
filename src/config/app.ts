export const APP_CONFIG = {
    name: "MigFin: Financial Literacy for Migrant Workers",
    shortName: "MigFin",
    description: "Empowering migrant workers with financial knowledge and safe remittance tools",
    tagline: "Learn, Save, and Send Money Safely",
    version: "1.0.0",
    author: "MigFin Team",
    url: "https://migfin.org",

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
