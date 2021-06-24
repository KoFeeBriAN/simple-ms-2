"use strict";

const express = require("express");
const axios = require("axios");
const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());

app.get(`/`, (req, res) => {
	res.send("Hello world");
});

/**
 * @description Count 'word' in the given string
 * @returns a number of 'word' in the string
 */
app.post(`/`, async (req, res) => {
	const { text, word } = req.body;
	if (!text || !word)
		return res.status(400).json({ text, word, result: null, message: "Bad request" });

	let result;
	let response;
	try {
		response = await axios.post(`http://redis-client:4000/get`, {
			key: text,
		});

		console.log("logs get data", response.data);

		if (response?.data?.message !== "OK") {
			return res.status(200).json({
				message: "From cache",
				text,
				word,
				result: response.data,
			});
		}
	} catch (error) {
		console.log("No cache");
		console.error(error);
	}

	result = text.match(new RegExp(word, "g")).length;

	try {
		response = await axios.post(`http://redis-client:4000/set`, { key: text, value: result });
		console.log("logs set data", response.data);
	} catch (error) {
		console.log("Save to cache failed");
		console.error(error);
	}

	res.status(200).json({
		message: "OK",
		text,
		word,
		result: result,
	});
});

app.listen(port, () => console.log(`App listening on port ${port}`));
