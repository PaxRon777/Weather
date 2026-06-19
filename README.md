# 🌤️ SkyCast | Modern Weather Dashboard

SkyCast is a sleek, high-performance weather dashboard designed with a focus on minimalist aesthetics and smooth user experience. It provides real-time weather data, hourly forecasts, and weekly outlooks using a modern "Glassmorphism" design language.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ Features

-   **Real-time Search:** Find weather data for any town or city worldwide using integrated Geocoding.
-   **Comprehensive Data:** 
    -   Current temperature, precipitation, and wind speed.
    -   UV Index, Sunrise, and Sunset times.
    -   Detailed Hourly Forecast with dynamic icons.
    -   7-Day Weekly Outlook with visual progress bars for temperature ranges.
-   **Personalization:**
    -   **Favorites:** Save your favorite towns to local storage for quick access.
    -   **Default Town:** Set a preferred city that loads automatically on startup.
    -   **Atmospheric Background:** A toggleable, animated "rising circle" background for an immersive experience.
-   **Responsive Design:** Fully optimized for mobile, tablet, and desktop screens using Tailwind CSS.

## 🚀 Tech Stack

-   **Frontend:** HTML5, CSS3 (Custom Animations), JavaScript (ES6+).
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) (via CDN) for rapid UI development.
-   **Icons:** [Lucide Icons](https://lucide.dev/) for clean, consistent iconography.
-   **APIs:** 
    -   [Open-Meteo Weather API](https://open-meteo.com/): For high-quality, free weather data.
    -   [Open-Meteo Geocoding API](https://geocoding-api.open-meteo.com/): To convert city names into coordinates.

## 🛠️ Installation & Setup

Since this is a client-side application, there is no complex build process required.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/PaxRon777/SkyCast.git
    ```
2.  **Navigate to the project folder:**
    ```bash
    cd SkyCast
    ```
3.  **Run the app:**
    Simply open `weather.html` in any modern web browser (Chrome, Firefox, Edge, Safari).
    
## 💡 How it Works

-   **Data Fetching:** The app first hits the Geocoding API to retrieve latitude and longitude based on user input, then passes those coordinates to the Weather API.
-   **Persistence:** It uses `localStorage` to remember your "Favorite" towns, your "Default" town, and your background animation preferences even after you refresh the page.
-   **Dynamic UI:** The hourly grid is designed with a custom scroll listener that allows for smooth mouse-wheel navigation on desktop.

## 📄 License

Distributed under the MIT License. Read [LICENSE](LICENSE) here 
