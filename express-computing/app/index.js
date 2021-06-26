"use strict";

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
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
	// If no text or word provide, return Bad Request
	if (!text || !word)
		return res.status(400).json({ text, word, result: null, message: "Bad request" });

	let result;
	let response;
	try {
		// Check in Cache
		response = await axios.post(`http://localhost:4000/get`, {
			key: text + " " + word,
		});

		console.log("logs get data", response.data);

		// If found, reture result
		if (response?.status === 200) {
			return res.status(200).json({
				message: "From Cache",
				text,
				word,
				result: response.data.data,
			});
		}
	} catch (error) {
		console.log("No cache");
		console.error(error.response);
	}

	// Perform counting
	result = text.match(new RegExp(word, "g"))?.length;
	if (!result) result = 0;

	try {
		// Save to Cache
		response = await axios.post(`http://localhost:4000/set`, {
			key: text + " " + word,
			value: result,
		});
		console.log("logs set data", response.data);
	} catch (error) {
		console.log("Save to cache failed");
		console.error(error.response);
	}

	res.status(200).json({
		message: "OK",
		text,
		word,
		result: result,
	});
});

app.listen(port, () => console.log(`App listening on port ${port}`));
