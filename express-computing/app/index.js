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
app.post(`/`, (req, res) => {
	const { text, word } = req.body;
	if (!text || !word) res.status(400).json({ text, word, result: null, message: "Bad request" });

	const result = text.match(new RegExp(word, "g")).length;
	res.status(200).json({
		message: "OK",
		text,
		word,
		result,
	});
});

app.listen(port, () => console.log(`App listening on port ${port}`));
