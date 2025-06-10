import { useState, useEffect } from 'react';
import axios from 'axios';
import cities from './cities.json';


const fetchWeatherData = async (
	city: string,
	startDate: string,
	endDate: string,
): Promise<{ date: string; condition: string; maxtemp_c: number; mintemp_c: number }[]> => {
	const BASE_URL = "https://api.weatherapi.com/v1";
	const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

	const start = new Date(startDate);
	const end = new Date(endDate);
	const dates: string[] = [];

	for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
		dates.push(new Date(d).toISOString().slice(0, 10));
	}

	const allForecasts = await Promise.all(
		dates.map(async (date) => {
			const res = await axios.get(`${BASE_URL}/history.json`, {
				params: { key: API_KEY, q: city, dt: date },
			});
			return res.data;
		})
	);

	return allForecasts.map((f) => ({
		date: f.forecast.forecastday[0].date,
		condition: f.forecast.forecastday[0].day.condition.text,
		maxtemp_c: f.forecast.forecastday[0].day.maxtemp_c,
		mintemp_c: f.forecast.forecastday[0].day.mintemp_c,
	}));
};


type Entry = {
	id: number;
	city: string;
	country: string;
	startDate: string;
	endDate: string;
	data: {
		date: string;
		condition: string;
		maxtemp_c: number;
		mintemp_c: number;
	}[];
};

const date_fmt = (d: Date) => d.toISOString().slice(0, 10);

export default function Database() {
	const [entries, setEntries] = useState<Entry[]>([]);
	const [selected, setSelected] = useState<Set<number>>(new Set());
	const [shown, setShown] = useState<Entry[]>([]);
	const [suggestions, setSuggestions] = useState<City[]>([]);
	const [activeInput, setActiveInput] = useState<number | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await axios.get('http://localhost:3001/api/weather');
				setEntries(res.data);
			} catch (err) {
				console.error("Failed to load entries", err);
			}
		};
		fetchData();
	}, []);

	const toggle = (id: number) => {
		setSelected(prev => {
			const copy = new Set(prev);
			copy.has(id) ? copy.delete(id) : copy.add(id);
			return copy;
		});
	};


	return (
		<div className="p-4">
		<h2 className="text-lg font-semibold mb-4">Saved Weather Entries</h2>


<table className="w-full border text-sm mb-2">
  <thead>
    <tr className="bg-gray-200 text-left">
      <th className="border px-2 py-1">✓</th>
      <th className="border px-2 py-1">ID</th>
      <th className="border px-2 py-1">City</th>
      <th className="border px-2 py-1">Country</th>
      <th className="border px-2 py-1">Range</th>
      <th className="border px-2 py-1">Days</th>
      </tr>
      </thead>
      <tbody>
      {entries.map((e, idx) => (
	      <tr key={e.id} className={e._modified ? "bg-yellow-100" : ""}>
	      <td className="border px-2 py-1 text-center">
	      <input
	      type="checkbox"
	      checked={selected.has(e.id)}
	      onChange={() => toggle(e.id)}
	      />
	      </td>
	      <td className="border px-2 py-1">{e.id}</td>
	      <td className="border px-2 py-1 relative">
	      <input
	      className="w-full bg-transparent"
	      value={e.city}
	      onFocus={() => setActiveInput(e.id)}
	      onBlur={() => setTimeout(() => setActiveInput(null), 100)}
	      onChange={(ev) => {
		      const input = ev.target.value;
		      const updated = [...entries];
		      updated[idx] = { ...e, city: input, _modified: true };
		      setEntries(updated);

		      if (input.length > 1) {
			      const matches = (cities as City[]).filter(c =>
									c.city.toLowerCase().includes(input.toLowerCase())
								       ).slice(0, 8);
								       setSuggestions(matches);
		      } else {
			      setSuggestions([]);
		      }
	      }}
	      />
	      {activeInput === e.id && suggestions.length > 0 && (
		      <ul className="absolute z-10 bg-white text-black border w-full mt-1 max-h-40 overflow-y-auto rounded shadow">
		      {suggestions.map((s, i) => (
			      <li
			      key={i}
			      className="px-2 py-1 hover:bg-blue-100 cursor-pointer"
			      onMouseDown={() => {
				      const updated = [...entries];
				      updated[idx] = {
					      ...e,
					      city: s.city,
					      country: s.country,
					      _modified: true,
				      };
				      setEntries(updated);
				      setSuggestions([]);
			      }}
			      >
			      {s.city}, {s.country}
			      </li>
		      ))}
		      </ul>
	      )}
	      </td>
	      <td className="border px-2 py-1">{e.country}</td>
	      <td className="border px-2 py-1">
	      <input
	      type="date"
	      max={date_fmt(new Date())}
	      className="bg-transparent"
	      value={e.startDate}
	      onChange={(ev) => {
		      const updated = [...entries];
		      updated[idx] = { ...e, startDate: ev.target.value, _modified: true };
		      setEntries(updated);
	      }}
	      />
	      →
	      <input
	      type="date"
	      max={date_fmt(new Date())}
	      className="bg-transparent"
	      value={e.endDate}
	      onChange={(ev) => {
		      const updated = [...entries];
		      updated[idx] = { ...e, endDate: ev.target.value, _modified: true };
		      setEntries(updated);
	      }}
	      />
	      </td>
	      <td className="border px-2 py-1">{e.data.length} day(s)</td>
	      </tr>
      ))}
      </tbody>
      </table>



		<div className="flex gap-2 mb-4">
		<button
		className="bg-blue-500 text-white px-3 py-1 rounded"
		onClick={() => setShown(entries.filter(e => selected.has(e.id)))}
		>
		Show
		</button>

		<button
		className="bg-green-700 text-white px-3 py-1 rounded"
		onClick={async () => {
			const modified = entries.filter(e => e._modified);

			const updatedEntries = await Promise.all(
				modified.map(async (e) => {
					const newData = await fetchWeatherData(e.city, e.startDate, e.endDate);
					await axios.put(`http://localhost:3001/api/weather/${e.id}`, {
						city: e.city,
					startDate: e.startDate,
					endDate: e.endDate,
					data: newData,
					});
					return { ...e, data: newData, _modified: false };
				})
			);

			setEntries(prev =>
				   prev.map(e => updatedEntries.find(u => u.id === e.id) ?? e)
				  );
		}}
		>
		Save Changes
		</button>

		<button
		className="bg-red-500 text-white px-3 py-1 rounded"
		onClick={async () => {
			try {
				await Promise.all(
					Array.from(selected).map(id =>
								 axios.delete(`http://localhost:3001/api/weather/${id}`)
								)
				);
				setEntries(prev => prev.filter(e => !selected.has(e.id)));
				setShown(prev => prev.filter(e => !selected.has(e.id)));
				setSelected(new Set());
			} catch (err) {
				console.error("Delete failed", err);
			}
		}}
		>
		Delete
		</button>



		</div>

		{shown.map(entry => (
			<div key={entry.id} className="mb-4">
			<p className="font-bold mb-1">{entry.city}, {entry.country} ({entry.startDate} → {entry.endDate})</p>
			<div className="grid grid-cols-2 md:grid-cols-5 gap-2">
			{entry.data.map((d, i) => (
				<div key={i} className="border p-2 rounded shadow">
				<p className="font-medium">{d.date}</p>
				<p>{d.condition}</p>
				<p>Max: {d.maxtemp_c}°C</p>
				<p>Min: {d.mintemp_c}°C</p>
				</div>
			))}
			</div>
			</div>
		))}
		</div>
	);
}
