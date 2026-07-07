import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://obgeqqlfozftgjcfhguh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iZ2VxcWxmb3pmdGdqY2ZoZ3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MDkwNjMsImV4cCI6MjA5ODk4NTA2M30.Aw6GfUANI_P5yRRHuCWEsrhIpC2d2xBvKbcJ8duhdJo';

const supabase = createClient(supabaseUrl, supabaseKey);

const apps = [
    {
        title: "B Corder Mobile",
        type: "mobile",
        version: "1.0",
        short_description: "Transform your Android device into a high-speed, professional barcode scanner.",
        image_url: "assets/bcorder_logo.png",
        description: JSON.stringify({
            category: "Hardware Utility",
            description: "Transform your Android device into a high-speed, professional barcode scanner. Connects seamlessly directly to your PC, eliminating the need for expensive dedicated scanner hardware.",
            special_note: "Includes the required PC Suite software completely free.",
            features: ["Zero-Latency Scan", "Wireless PC Sync", "Inventory Ready"],
            is_live: true,
            download_link: "javascript:void(0)"
        })
    },
    {
        title: "DYC App",
        type: "mobile",
        version: "1.0",
        short_description: "A comprehensive mobile application tailored for streamlined service management.",
        image_url: "assets/dyc_logo.png",
        description: JSON.stringify({
            category: "Service & Operations",
            description: "A comprehensive mobile application tailored for streamlined service management and client interactions. Keep your workflow strictly professional and highly responsive.",
            special_note: "",
            features: ["Service Management", "Client Database", "Real-time Updates"],
            is_live: true,
            download_link: "https://play.google.com/store/apps/details?id=com.dyc.lk"
        })
    },
    {
        title: "HelpMate App",
        type: "mobile",
        version: "1.0",
        short_description: "Your ultimate digital assistant for emergency and first-aid situations.",
        image_url: "assets/helpmate.png",
        description: JSON.stringify({
            category: "Emergency Utility",
            description: "Your ultimate digital assistant for emergency and first-aid situations. Featuring integrated access to emergency services, first-aid tutorials, and quick communication tools.",
            special_note: "",
            features: ["SOS Integration", "First-Aid Guide", "Location Sharing"],
            is_live: true,
            download_link: "https://play.google.com/store/apps/details?id=com.helpmate.lk"
        })
    },
    {
        title: "Riya Mithuru V4",
        type: "mobile",
        version: "4.0",
        short_description: "The definitive assistant for drivers.",
        image_url: "assets/riya_logo.png",
        description: JSON.stringify({
            category: "Automotive",
            description: "The definitive assistant for drivers. From road rules and quiz modules for learner drivers to advanced utility features, this app is the complete automotive companion.",
            special_note: "",
            features: ["Road Rules Guide", "Learner Quizzes", "Vehicle Utility"],
            is_live: true,
            download_link: "https://play.google.com/store/apps/details?id=com.riyamithuru"
        })
    },
    {
        title: "Tiffie",
        type: "mobile",
        version: "1.0",
        short_description: "A beautifully designed, premium utility app.",
        image_url: "assets/tiffie_logo.png",
        description: JSON.stringify({
            category: "Lifestyle",
            description: "A beautifully designed, premium utility app that enhances your daily interactions. Built on ultra-fast architecture ensuring an unparalleled user experience.",
            special_note: "",
            features: ["Fluid Interface", "Dark Mode", "Fast Performance"],
            is_live: true,
            download_link: "javascript:void(0)"
        })
    },
    {
        title: "Rupix Mobile",
        type: "mobile",
        version: "1.0",
        short_description: "The mobile companion for your Rupix PRO V2.4 suite.",
        image_url: "assets/rupix_mobile.png",
        description: JSON.stringify({
            category: "Retail Utility",
            description: "The mobile companion for your Rupix PRO V2.4 suite. Monitor inventory, track sales, and manage your entire business securely on the go.",
            special_note: "",
            features: ["Real-time Analytics", "Remote Inventory", "Secure Link"],
            is_live: true,
            download_link: "pc.html"
        })
    }
];

async function migrate() {
    for (let app of apps) {
        const { data, error } = await supabase.from('software').insert([app]).select();
        if (error) {
            console.error("Error inserting", app.title, error);
            continue;
        }
        const newAppId = data[0].id;
        console.log("Inserted", app.title, "with ID", newAppId);
        
        // Insert screenshots mapping
        let screenUrls = [];
        if (app.title === "B Corder Mobile") {
            screenUrls = ["assets/bcorder_1.png"];
        } else if (app.title === "DYC App") {
            screenUrls = ["assets/For Apps/DYC/dyc_1.png", "assets/For Apps/DYC/dyc_2.png"];
        } else if (app.title === "HelpMate App") {
            screenUrls = ["assets/For Apps/Helpmate/WhatsApp Image 2026-04-22 at 5.21.27 PM (1).jpeg", "assets/For Apps/Helpmate/WhatsApp Image 2026-04-22 at 5.21.27 PM.jpeg"];
        } else if (app.title === "Riya Mithuru V4") {
            screenUrls = ["assets/For Apps/Riya Mithuru/Screenshot_2026-06-18-12-29-51-559_com.riyamithuru.jpg", "assets/For Apps/Riya Mithuru/Screenshot_2026-06-18-12-43-00-255_com.riyamithuru.jpg"];
        } else if (app.title === "Tiffie") {
            screenUrls = ["assets/tiffie.png"];
        } else if (app.title === "Rupix Mobile") {
            screenUrls = ["assets/For Apps/Rupix App/Screenshot_2026-07-06-22-05-02-245_com.rupixpro.jpg", "assets/For Apps/Rupix App/Screenshot_2026-07-06-22-05-24-330_com.rupixpro.jpg"];
        }
        
        for (let sUrl of screenUrls) {
            await supabase.from('screenshots').insert([{ software_id: newAppId, image_url: sUrl }]);
            console.log("Inserted screenshot for", app.title, sUrl);
        }
    }
    console.log("Migration complete!");
}

migrate();
