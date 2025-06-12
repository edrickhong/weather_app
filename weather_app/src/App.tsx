import { useState } from 'react'
import axios from 'axios'
import Weather from './Weather'
import DB from './DB'

function App() {

	const [tab, setTab] = useState<'weather' | 'database'>('weather');



	return (
		<div className="p-4 font-sans">

		<div className="flex gap-4 mb-4">
		<button
		className={`px-4 py-2 rounded ${tab === 'weather' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
		onClick={() => setTab('weather')}
		>
		Weather
		</button>
		<button
		className={`px-4 py-2 rounded ${tab === 'database' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
		onClick={() => setTab('database')}
		>
		Saved
		</button>
		</div>


		<h1 className="text-xl font-bold mb-2">Weather App</h1>


		{tab === 'weather' && <Weather />}
		{tab === 'database' && <DB />}

		</div>
	);
}

export default App;

