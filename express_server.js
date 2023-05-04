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

// Helper function to get user object by email
const getUserByEmail = (email) => {
	for (const userId in users) {
		if (users[userId].email === email) {
			return users[userId];
		}
	}
	return null;
};

const urlDatabase = {
	b2xVn2: "http://www.lighthouselabs.ca",
	"9sm5xK": "http://www.google.com",
};

const users = {
	userRandomID: {
		id: "userRandomID",
		email: "user@example.com",
		password: "purple-monkey-dinosaur",
	},
	user2RandomID: {
		id: "user2RandomID",
		email: "user2@example.com",
		password: "dishwasher-funk",
	},
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
	console.log("userid", req.cookies.user_id);
	const templateVars = {
		user: users[req.cookies.user_id],
		urls: urlDatabase,
	};
	console.log(templateVars.user);
	res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
	const templateVars = {
		user: users[req.cookies.user_id],
		urls: urlDatabase,
	};

	res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
	const templateVars = {
		user: users[req.cookies.user_id],
		id: req.params.id,
		longURL: urlDatabase[req.params.id],
		urls: urlDatabase,
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
app.get("/login", (req, res) => {
	res.render("login", { user: null });
});

app.post("/login", (req, res) => {
	const { email, password } = req.body;

	const user = getUserByEmail(email);

	if (!user) {
		res
			.status(403)
			.send(
				"Email adress was not found... Please check the spelling and try again!"
			);
	} else if (password !== user.password) {
		res
			.status(403)
			.send("Password was Invalid... Please check the spelling and try again!");
	} else {
		res.cookie("user_id", user.id);
		res.redirect("/urls");
	}
});

app.post("/logout", (req, res) => {
	res.clearCookie("user_id");
	res.redirect("/urls");
});

app.get("/register", (req, res) => {
	res.render("register", { user: null });
});

app.post("/register", (req, res) => {
	console.log(req.body);
	const id = generateRandomString();
	const { email, password } = req.body;

	// Check if email or password are empty
	if (!email || !password) {
		res.status(400).send("Email and password cannot be empty");
		return;
	}

	// Check if email is already registered
	if (getUserByEmail(email)) {
		res.status(400).send("Email already registered");
		return;
	}

	//Create a new user object
	const newUser = {
		id,
		email,
		password,
	};
	users[id] = newUser;
	console.log(newUser);
	res.cookie("user_id", newUser["id"]);
	console.log(users);
	res.redirect("/urls");
});

app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});
