"use strict";

const express = require("express");
const crypto = require("crypto-js");
const app = express();

const port = process.env.PORT || 4000;

const client = require("redis").createClient(process.env.REDIS_PORT, "redis");
client.on("connect", () => console.log("Connected to redis"));
client.on("error", (err) => "Redis error " + err);

app.use(express.json());

app.get(`/health`, (_, res) => {
	res.send(`OK`);
});

app.post(`/get`, (req, res) => {
	const { key } = req.body;
	const hashedKey = crypto.SHA256(key);
	client.get(hashedKey, (error, data) => {
		if (error) {
			return res.status(400).json({ message: "Something wrong!", error });
		}
		return res.status(200).json({ message: "OK", data });
	});
});

app.post(`/set`, (req, res) => {
	const { key, value } = req.body;
	const hashedKey = crypto.SHA256(key);
	client.setex(hashedKey, 60, value, (error, reply) => {
		if (error) {
			return res.status(400).json({ message: "Error", error });
		}
		return res.status(200).json({ message: reply });
	});
});

app.listen(port, () => console.log(`Redis client listening on port: ${port}`));
