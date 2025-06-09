import { useState } from 'react'
import axios from 'axios'
import cities from './cities.json'

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = "https://api.weatherapi.com/v1";


const today = new Date();
const fifth_day = new Date(new Date(today).setDate(today.getDate() + 5));

const date_fmt = (d: Date) => d.toISOString().slice(0,10);

type WeatherResponse = {
	location: {
		name: string;
		country: string;
	};

	current?: {
		temp_c: number;
		condition: {
			text: string;
			icon: string;
		};
	};

	forecast?: {
		forecastday: {
			date: string;
			day: {
				maxtemp_c: number;
				mintemp_c: number;
				condition: {
					text: string;
					icon: string;
				};
			};
		}[];
	};
};

type City = {
	city: string;
	country: string;
	lat: string;
	lng: string;
};

function App() {
	const [city, setCity] = useState('');
	const [weather, setWeather] = useState<WeatherResponse | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [suggestions, setSuggestions] = useState<typeof cities>([]);
	const [showForecast, setShowForecast] = useState(false);
	const [startDate, setStartDate] = useState(date_fmt(today));
	const [endDate, setEndDate] = useState(date_fmt(fifth_day));

	const fetchWeather = async (inputCity?: string): Promise<void> => {

		if (new Date(startDate) > new Date(endDate)) {
			setError("Start date must be before end date.");
			return;
		}

		setError(null);
		const target = inputCity ?? city;

		try {
			if (showForecast && startDate && endDate) {
				const start = new Date(startDate);
				const end = new Date(endDate);
				const dates: string[] = [];

				for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
					dates.push(new Date(d).toISOString().slice(0, 10)); // clone d before slicing
				}

				const allForecasts = await Promise.all(
					dates.map(async (date) => {
						const res = await axios.get(`${BASE_URL}/history.json`, {
							params: {
								key: API_KEY,
								q: target,
								dt: date,
							},
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
			} else {
				const res = await axios.get(`${BASE_URL}/current.json`, {
					params: {
						key: API_KEY,
						q: target,
					},
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
						params: {
							key: API_KEY,
							q: `${latitude},${longitude}`,
						},
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
			<h1 className="text-xl font-bold mb-2">Weather App</h1>

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

					<button type="button" className="bg-blue-500 text-white px-3 py-1 rounded" onClick={UseCurrentLoc}>
						Use Current Location
					</button>


					<div className="flex flex-col gap-1">


					{showForecast && (

						<>

						<label>
							Start Date:
							<input
								type="date"
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
								className="border px-2 py-1 w-full"
							/>
						</label>

						<label>
							End Date:
							<input
								type="date"
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
								className="border px-2 py-1 w-full"
							/>
						</label>
						</>
					)}
						<label className="flex items-center gap-1">
							<input
								type="checkbox"
								checked={showForecast}
								onChange={(e) => setShowForecast(e.target.checked)}
							/>
							Use Date Range
						</label>
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

			{showForecast && weather?.forecast?.forecastday && (
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
		</div>
	);
}

export default App;

