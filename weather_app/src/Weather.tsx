import { useState } from 'react';
import axios from 'axios';
import cities from './cities.json';

export default function Weather() {
	const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
	const BASE_URL = "https://api.weatherapi.com/v1";
	const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

	const today = new Date();
	const fifth_day = new Date(new Date(today).setDate(today.getDate() - 5));
	const date_fmt = (d: Date) => d.toISOString().slice(0, 10);

	const [city, setCity] = useState('');
	const [weather, setWeather] = useState<WeatherResponse | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [suggestions, setSuggestions] = useState<City[]>([]);
	const [showForecast, setShowForecast] = useState(false);
	const [startDate, setStartDate] = useState(date_fmt(fifth_day));
	const [endDate, setEndDate] = useState(date_fmt(today));

	const fetchWeather = async (inputCity?: string): Promise<void> => {
		if (new Date(startDate) > new Date(endDate)) {
			setError("Start date must be before end date.");
			return;
		}

		setError(null);
		const target = inputCity ?? city;

		try {
			if (showForecast) {
				// Use historical forecast (date range)
				const start = new Date(startDate);
				const end = new Date(endDate);
				const dates: string[] = [];

				for (let d = new Date(start); d <= end; ) {
					dates.push(d.toISOString().slice(0, 10));
					d = new Date(d.getTime() + 86400000);
				}

				const allForecasts = await Promise.all(
					dates.map(async (date) => {
						const res = await axios.get(`${BASE_URL}/history.json`, {
							params: { key: API_KEY, q: target, dt: date },
						});
						return res.data;
					})
				);

				setWeather({
					location: allForecasts[0].location,
					forecast: {
						forecastday: allForecasts.map(f => f.forecast.forecastday[0]),
					},
				});
			} else if (startDate !== endDate) {
				// 5-day forecast mode
				const res = await axios.get(`${BASE_URL}/forecast.json`, {
					params: { key: API_KEY, q: target, days: 5 },
				});
				setWeather(res.data);
			} else {
				// Today-only current mode
				const res = await axios.get(`${BASE_URL}/current.json`, {
					params: { key: API_KEY, q: target },
				});
				setWeather(res.data);
			}
		} catch (err) {
			console.error(err);
			setError("Failed to fetch weather.");
			setWeather(null);
		}

		setSuggestions([]);
	};




	const UseCurrentLoc = async (): Promise<void> => {
		if (!navigator.geolocation) {
			alert("Geolocation not supported.");
			return;
		}

		navigator.geolocation.getCurrentPosition(
			async ({ coords: { latitude, longitude } }) => {
				try {
					const res = await axios.get(`${BASE_URL}/current.json`, {
						params: { key: API_KEY, q: `${latitude},${longitude}` },
					});
					const data = res.data;
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

	return (
		<div className="p-4 font-sans">

		<div className="flex gap-2 mb-4">
		<form
		onSubmit={(e) => {
			e.preventDefault();
			fetchWeather();
		}}
		className="flex gap-2 mb-4"
		>
		<div className="relative w-[250px]">
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
					fetchWeather(entry.city);
				}}
				>
				{entry.city}, {entry.country}
				</li>
			))}
			</ul>
		)}
		</div>

		<button
		type="button"
		className="bg-blue-500 text-white px-3 py-1 rounded"
		onClick={UseCurrentLoc}
		>
		Use Current Location
		</button>

		<div className="flex flex-col gap-1">
		{showForecast && (
			<>
			<label>
			Start Date:
				<input
			type="date"
			max={date_fmt(today)}
			value={startDate}
			onChange={(e) => setStartDate(e.target.value)}
			className="border px-2 py-1 w-full"
			/>
			</label>

			<label>
			End Date:
				<input
			type="date"
			max={date_fmt(today)}
			value={endDate}
			onChange={(e) => setEndDate(e.target.value)}
			className="border px-2 py-1 w-full"
			/>
			</label>
			</>
		)}


		<div className="flex flex-col gap-1">
		<label className="flex items-center gap-2">
		<input
		type="radio"
		name="mode"
		checked={!showForecast && startDate === endDate}
		onChange={() => {
			const todayStr = date_fmt(new Date());
			setShowForecast(false);
			setStartDate(todayStr);
			setEndDate(todayStr);
		}}
		/>
		Today
		</label>

		<label className="flex items-center gap-2">
		<input
		type="radio"
		name="mode"
		checked={!showForecast && startDate !== endDate}
		onChange={() => {
			const today = new Date();
			const fifth = new Date(today);
			fifth.setDate(today.getDate() + 4);
			setShowForecast(false);
			setStartDate(date_fmt(today));
			setEndDate(date_fmt(fifth));
		}}
		/>
		5-Day Forecast
		</label>

		<label className="flex items-center gap-2">
		<input
		type="radio"
		name="mode"
		checked={showForecast}
		onChange={() => setShowForecast(true)}
		/>
		Custom Range
		</label>
		</div>


		</div>
		</form>
		</div>

		{error && <p className="text-red-500">{error}</p>}

		{!showForecast && weather?.current && (
			<div className="bg-gray-100 p-4 rounded">
			<p><strong>{weather.location.name}, {weather.location.country}</strong></p>
			<p>{weather.current.condition.text}</p>
			<p>Temp: {weather.current.temp_c}°C</p>
			<img src={weather.current.condition.icon} alt="icon" />
			</div>
		)}
		{weather?.forecast?.forecastday && (
			<div>
			<p className="font-semibold mb-2">
			{weather.location.name}, {weather.location.country}
			</p>
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


		{weather && (
			<button
			onClick={async () => {
				try {
					const data = showForecast
						? weather.forecast?.forecastday.map(day => ({
							date: day.date,
							condition: day.day.condition.text,
							maxtemp_c: day.day.maxtemp_c,
							mintemp_c: day.day.mintemp_c,
						})) ?? []
							: weather.current
								? [{
									date: date_fmt(today),
									condition: weather.current.condition.text,
									maxtemp_c: weather.current.temp_c,
									mintemp_c: weather.current.temp_c,
								}]
									: [];

									await axios.post(`${BACKEND_URL}/api/weather`, {
										city: weather.location.name,
										country: weather.location.country,
										startDate: showForecast ? startDate : date_fmt(today),
										endDate: showForecast ? endDate : date_fmt(today),
										data,
									});
				} catch (err) {
					console.error("Save failed:", err);
				}
			}}
			className="bg-green-500 text-white px-3 py-1 rounded mt-2"
			>
			Save This Weather
			</button>
		)}
		</div>
	);
}

type City = {
	city: string;
	country: string;
	lat: string;
	lng: string;
};

type WeatherResponse = {
	location: { name: string; country: string };
	current?: {
		temp_c: number;
		condition: { text: string; icon: string };
	};
	forecast?: {
		forecastday: {
			date: string;
			day: {
				maxtemp_c: number;
				mintemp_c: number;
				condition: { text: string; icon: string };
			};
		}[];
	};
};

