"use strict";

const express = require("express");
const cors = require("cors");
const app = express();

const port = process.env.PORT || 4000;

const client = require("redis").createClient(process.env.REDIS_PORT, "redis");
client.on("connect", () => console.log("Connected to redis"));
client.on("error", (err) => "Redis error " + err);

app.use(cors());
app.use(express.json());

app.get(`/health`, (_, res) => {
	res.send(`OK`);
});

app.post(`/get`, (req, res) => {
	const { key } = req.body;
	console.log("key", key);

	const buff = Buffer.from(key);
	const base64 = buff.toString("base64");
	console.log("key base64", base64);

	client.get(base64, (error, data) => {
		if (error) {
			return res.status(500).json({ message: "Error", error });
		} else if (!data) {
			return res.status(404).json({ message: "Not Found", data: null });
		}
		return res.status(200).json({ message: "OK", data });
	});
});

app.post(`/set`, (req, res) => {
	const { key, value } = req.body;

	const buff = Buffer.from(key);
	const base64 = buff.toString("base64");
	console.log("key base64", base64);

	client.setex(base64, 60, value, (error, reply) => {
		if (error) {
			return res.status(500).json({ message: "Error", error });
		}
		return res.status(200).json({ message: reply, key: base64, value });
	});
});

app.listen(port, () => console.log(`Redis client listening on port: ${port}`));
