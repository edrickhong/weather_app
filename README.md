# Weather App 🌤️

This is my submission for **Tech Assessment 1 & 2** of the AI/ML Software Engineer Intern role.

## 🔧 Features

- Search weather by city with fuzzy suggestions
- Get weather based on current location using browser geolocation
- CRUD operations to create/read/update/delete weather entries
- Toggle 5-day forecast view
- Weather data from [weatherapi.com](https://www.weatherapi.com/)
- Tailwind CSS styling
- Built with React, TypeScript, Vite

## 🧪 How to Run Locally

1. Clone the repo:
   ```bash
   git clone https://github.com/edrickhong/weather_app.git
   cd weather_app/weather_app
   ```

2. Install dependencies:
   ```bash
   yarn
   ```

3. Set up your API key (from https://weatherapi.com) and backend URL:
   ```bash
   echo "VITE_WEATHER_API_KEY=your_key_here" > .env
   echo "VITE_BACKEND_URL=your_url_here" >> .env
   ```
4. Start the backend server:
   ```bash
   yarn build && yarn start
   #If deploying om a remote server
   yarn build && yarn start --deploy
   ```

5. Start the dev server:
   ```bash
   yarn dev
   ```

## 🚀 Live Demo

Hosted on GitHub Pages:  
➡️ [https://edrickhong.github.io/weather_app/](https://edrickhong.github.io/weather_app/)
<br>**Note**: App functionality is contingent on API key being valid at current time. CRUD "Saved" tab operation is contingent on the server being online.

## 📁 Notes

- Requires Node.js and Yarn
- Built with reproducibility using Nix Flakes (`flake.nix`)
