const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

function generateRandomString() {
	let result = "";
	const characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const length = 6;

	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		result += characters.charAt(randomIndex);
	}

	return result;
}

const urlDatabase = {
	b2xVn2: "http://www.lighthouselabs.ca",
	"9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
	res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
	res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
	res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
	const templateVars = {
		username: req.cookies["username"],
		urls: urlDatabase,
	};
	res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
	res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
	const templateVars = {
		id: req.params.id,
		longURL: urlDatabase[req.params.id],
	};
	res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
	console.log(req.body); // Log the POST request body to the console
	// const urlDatabase = {
	// 	id: generateRandomString(),
	// 	longURL: req.body.longURL,
	// };
	// res.render("urls_show", urlDatabase);
	//^^ doenst save in the url_show page

	const id = generateRandomString();
	const longURL = req.body.longURL;
	urlDatabase[id] = longURL;
	//console.log(`id and longURL: ${id}, ${longURL}`);
	res.redirect(`/urls/${id}`);
});

app.get("/u/:id", (req, res) => {
	const shortURL = req.params.id;
	const longURL = urlDatabase[shortURL];

	if (longURL) {
		res.redirect(longURL);
	} else {
		res.status(404).send("Short URL not found");
	}
});

app.post("/urls/:id/delete", (req, res) => {
	const shortURL = req.params.id;
	if (urlDatabase.hasOwnProperty(shortURL)) {
		delete urlDatabase[shortURL];
	}
	res.redirect("/urls");
});

// app.post("/urls/:id", (req, res) => {
// 	const templateVars = {
// 		id: req.params.id,
// 		longURL: urlDatabase[req.params.id],
// 	};
// 	res.redirect("/urls");
// 	//res.render("urls_show", templateVars);
// });

app.post("/urls/:id", (req, res) => {
	const shortURL = req.params.id;
	const longURL = req.body.longURL;

	if (urlDatabase.hasOwnProperty(shortURL)) {
		urlDatabase[shortURL] = longURL;
	}

	res.redirect("/urls");
});

app.post("/login", (req, res) => {
	const username = req.body.username;
	res.cookie("username", username);
	res.redirect("/urls");
});

app.post("/logout", (req, res) => {
	const username = req.body.username;
	res.clearCookie("username", username);
	res.redirect("/urls");
});

app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});
