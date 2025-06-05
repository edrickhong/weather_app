import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
//import './App.css'

import axios from 'axios'
import cities from './cities.json'

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = "https://api.weatherapi.com/v1";

type WeatherResponse = {
	location: {
		name : string;
		country : string;
	};

	current: {
		temp_c: number; 
		condition:{
			text: string;
			icon: string;
		};
	};
};

async function GetWeatherNow(city: string): Promise<WeatherResponse> {
	const res = await axios.get<WeatherResponse>(
		`${BASE_URL}/current.json`,
		{
			params: {
				key: API_KEY,
				q: city,
			},
		},
	);


	return res.data; //TODO: pause here to see the actual format of the response
}

type City = {
	city : string;
	country : string;
	lat : string;
	lng : string;
};


function App() {
	const [city, setCity] = useState('');
	const [weather, setWeather] = useState<WeatherResponse | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [suggestions, setSuggestions] = useState<typeof cities>([]);
	const [showForecast,setShowForecast] = useState(false);

	const fetchWeather = async (inputCity?: string): Promise<void> => {
		setError(null);
		const target = inputCity ?? city;

		try {
			const url = `${BASE_URL}/${showForecast ? "forecast" : "current"}.json`;
			const res = await axios.get(url, {
				params: {
					key: API_KEY,
					q: target,
					...(showForecast ? { days: 5 } : {}),
				},
			});
			const data = res.data;
			setWeather(data);
		} catch (err) {
			console.error(err);
			setError("Failed to fetch weather.");
			setWeather(null);
		}
	};


	const UseCurrentLoc = async (): Promise<void> => {
		if (!navigator.geolocation) {
			alert("Geolocation not supported.");
			return;
		}

		navigator.geolocation.getCurrentPosition(
			async ({ coords: { latitude, longitude } }) => {


				console.log("lat long:",latitude,longitude);
				try {
					const res = await axios.get(`${BASE_URL}/current.json`, {
						params: {
							key: API_KEY,
							//q: "40.7128,-74.0060",
							q: `${latitude},${longitude}`,
						},
					});
					const data = res.data;
					console.log(data);
					console.log("Got city",data.location.name);

					setCity(data.location.name);
					fetchWeather(data.location.name);

				} catch (err) {
					console.error("Axios error:", err);
				}
			},
			(err) => {
				alert("Failed to get location.");
				console.error(err);
			}
		);
	};

		//<p className="text-pink-500 text-4xl font-bold">TAILWIND LIVE TEST</p>

	return (
		<div className="p-4 font-sans">
		<h1 className="text-xl font-bold mb-2">Weather App</h1>

		

		<div className="flex gap-2 mb-4">
		<form
		onSubmit={(e) => {
			e.preventDefault();
			fetchWeather();
		}}
		className="flex gap-2 mb-4"
		>
		<div className="relative w-[250px]"> {/* wrap input + dropdown */}
		<input
		className="border px-2 py-1 w-full"
		value={city}
		onChange={(e) => {
			const input = e.target.value;
			setCity(input);
			if (input.length > 1) {
				const matches = (cities as City[]).filter(entry =>
									  entry.city.toLowerCase().includes(input.toLowerCase())
									 ).slice(0, 10);
									 setSuggestions(matches);
			} else {
				setSuggestions([]);
			}
		}}
		placeholder="Enter city"
		/>
		{suggestions.length > 0 && (
			<ul className="absolute bg-white text-black border mt-1 max-h-48 overflow-y-auto z-10 w-full rounded shadow">
			{suggestions.map((entry, i) => (
				<li
				key={i}
				className="px-2 py-1 hover:bg-blue-100 cursor-pointer"
				onClick={() => {
					setCity(entry.city);
					setSuggestions([]);

					fetchWeather();
				}}
				>
				{entry.city}, {entry.country}
				</li>
			))}
			</ul>
		)}
		</div>

		<button
		className="bg-blue-500 text-white px-3 py-1 rounded"
		onClick={fetchWeather}
		>
		Get Weather
		</button>

		<button type="button" className="bg-blue-500 text-white px-3 py-1 rounded" onClick={UseCurrentLoc}>
		Use Current Location
		</button>


		<label className="flex items-center gap-1">
		<input
		type="checkbox"
		checked={showForecast}
		onChange={(e) => setShowForecast(e.target.checked)}
		/>
		Show 5-day forecast
		</label>

		</form>
		</div>


		{error && <p className="text-red-500">{error}</p>}
		{weather && (
			<div className="bg-gray-100 p-4 rounded">
			<p><strong>{weather.location.name}, {weather.location.country}</strong></p>
			<p>{weather.current.condition.text}</p>
			<p>Temp: {weather.current.temp_c}°C</p>
			<img src={weather.current.condition.icon} alt="icon" />
			</div>
		)}

		{showForecast && weather && "forecast" in weather && (
			<div className="mt-4">
			<h2 className="font-semibold mb-2">5-Day Forecast</h2>
			<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
			{weather.forecast.forecastday.map((day) => (
				<div key={day.date} className="bg-white text-black p-2 rounded shadow">
				<p className="font-medium">{day.date}</p>
				<img src={day.day.condition.icon} alt="icon" className="mx-auto" />
				<p>{day.day.condition.text}</p>
				<p>Max: {day.day.maxtemp_c}°C</p>
				<p>Min: {day.day.mintemp_c}°C</p>
				</div>
			))}
			</div>
			</div>
		)}

		</div>
	);
}


export default App
