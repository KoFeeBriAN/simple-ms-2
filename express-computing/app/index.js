"use strict";

const express = require("express");
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
	result = await fetch(`http:redis-client/${text}`);
	result = result.json();
	if (result?.data) {
		res.status(200).json({
			message: "From cache",
			text,
			word,
			result: result.data,
		});
	}

	result = text.match(new RegExp(word, "g")).length;

	await fetch(`http:redis-client/`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			key: text,
			value: result,
		}),
	});

	res.status(200).json({
		message: "OK",
		text,
		word,
		result,
	});
});

app.listen(port, () => console.log(`App listening on port ${port}`));
