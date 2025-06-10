import sqlite3 from 'sqlite3';
import path from 'path';

const DB_PATH = path.resolve('weather.db');
const db = new sqlite3.Database(DB_PATH);

export function initDB(): void {
	db.run(
		`CREATE TABLE IF NOT EXISTS weather (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			city TEXT NOT NULL,
			country TEXT NOT NULL,
			startDate TEXT NOT NULL,
			endDate TEXT NOT NULL,
			data TEXT NOT NULL
		)`,
		(err) => {
			if (err) console.error("Failed to init DB:", err);
		}
	);
}

export function insertWeather(
	city: string,
	country: string,
	startDate: string,
	endDate: string,
	data: any
): Promise<void> {
	return new Promise((resolve, reject) => {
		db.run(
			`INSERT INTO weather (city, country, startDate, endDate, data)
			 VALUES (?, ?, ?, ?, ?)`,
			[city, country, startDate, endDate, JSON.stringify(data)],
			(err) => (err ? reject(err) : resolve())
		);
	});
}

export function getAllWeather(): Promise<any[]> {
	return new Promise((resolve, reject) => {
		db.all(`SELECT * FROM weather`, (err, rows) => {
			if (err) return reject(err);
			resolve(rows.map((row: any) => ({
				...row,
				data: JSON.parse(row.data),
			})));
		});
	});
}

export function updateWeather(
	id: number,
	city: string,
	startDate: string,
	endDate: string,
	data: any
): Promise<void> {
	return new Promise((resolve, reject) => {
		db.run(
			`UPDATE weather SET city = ?, startDate = ?, endDate = ?, data = ? WHERE id = ?`,
			[city, startDate, endDate, JSON.stringify(data), id],
			(err) => (err ? reject(err) : resolve())
		);
	});
}



export function deleteWeather(id: number): Promise<void> {
	return new Promise((resolve, reject) => {
		db.run(`DELETE FROM weather WHERE id = ?`, [id], (err) =>
			err ? reject(err) : resolve()
		);
	});
}

