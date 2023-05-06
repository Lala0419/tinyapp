/////////////////////////////////////////////////////////////////////
// Requires
/////////////////////////////////////////////////////////////////////

const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

/////////////////////////////////////////////////////////////////////
// Initialization
/////////////////////////////////////////////////////////////////////

const app = express();
const PORT = 8080; // default port 8080

/////////////////////////////////////////////////////////////////////
// Configuration
/////////////////////////////////////////////////////////////////////

app.set("view engine", "ejs");

/////////////////////////////////////////////////////////////////////
// Middleware
/////////////////////////////////////////////////////////////////////

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

/////////////////////////////////////////////////////////////////////
// Database
/////////////////////////////////////////////////////////////////////

//For URLs
const urlDatabase = {
	b6UTxQ: {
		longURL: "https://www.tsn.ca",
		userID: "aJ48lW",
	},
	i3BoGr: {
		longURL: "https://www.google.ca",
		userID: "aJ48lW",
	},
};
console.log("urlDatabase:", urlDatabase);

//For users
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

/////////////////////////////////////////////////////////////////////
// Helper functions
/////////////////////////////////////////////////////////////////////

//To genarate ID
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

// To get user object by email
const getUserByEmail = (email) => {
	for (const userId in users) {
		if (users[userId].email === email) {
			return users[userId];
		}
	}
	return null;
};

//To check the userID is equal to the id of the currently logged-in user.

/////////////////////////////////////////////////////////////////////
// Routes
/////////////////////////////////////////////////////////////////////

//SHOW RANDING PAGE
app.get("/urls", (req, res) => {
	const templateVars = {
		user: users[req.cookies.user_id],
		urls: urlDatabase,
	};
	res.render("urls_index", templateVars);
});

//SHOW NEW OR LOGIN PAGE
app.get("/urls/new", (req, res) => {
	const userId = req.cookies.user_id;
	console.log(`userId, ${userId}`);
	const templateVars = {
		user: users[userId],
		urls: urlDatabase,
	};
	//Check to see if a user is logged in
	if (userId) {
		res.render("urls_new", templateVars);
	} else {
		res.redirect("/login");
	}
});

//SHOW SHOW PAGE
app.get("/urls/:id", (req, res) => {
	const templateVars = {
		user: users[req.cookies.user_id],
		id: req.params.id,
		longURL: urlDatabase[req.params.id].longURL,
		userID: urlDatabase[req.params.id].userID,
		urls: urlDatabase,
	};
	res.render("urls_show", templateVars);
});

//CREATE URL
app.post("/urls", (req, res) => {
	console.log(`req body:`, req.body);
	const id = generateRandomString();
	const longURL = req.body.longURL;
	const userId = req.cookies.user_id;
	if (userId) {
		urlDatabase[id] = {
			longURL,
			userId,
		};
		res.redirect(`/urls/${id}`);
	} else {
		res
			.status(400)
			.send(
				"You need to register or login to your account in order to shorten URL!"
			);
	}
});

//REDIRECT URL
app.get("/u/:id", (req, res) => {
	const shortURL = req.params.id;
	const longURL = urlDatabase[shortURL].longURL;

	if (longURL) {
		res.redirect(longURL);
	} else {
		res.status(404).send("Short URL not found");
	}
});

//DELETE URL
app.post("/urls/:id/delete", (req, res) => {
	const shortURL = req.params.id;
	const userID = req.cookies.user_id;
	if (urlDatabase.hasOwnProperty(shortURL)) {
		const url = urlDatabase[shortURL];
		if (url.userID === userID) {
			delete urlDatabase[shortURL];
		} else {
			res.status(403).send("You do not have permission to delete this URL");
		}
	}
	res.redirect("/urls");
});

//UPDATE URL
app.post("/urls/:id", (req, res) => {
	const shortURL = req.params.id;
	const longURL = req.body.longURL;
	const userID = req.cookies.user_id;
	if (urlDatabase.hasOwnProperty(shortURL)) {
		const url = urlDatabase[shortURL];
		if (url.userID === userID) {
			urlDatabase[shortURL].longURL = longURL;
		} else {
			res.status(403).send("You do not have permission to edit this URL");
		}
	}
	res.redirect("/urls");
});

//SHOW LOGIN PAGE
app.get("/login", (req, res) => {
	const userId = req.cookies.user_id;

	//Check to see if the user is the user is logged in
	if (userId) {
		res.redirect("/urls");
	} else {
		res.render("login", { user: null });
	}
});

//LOGIN
app.post("/login", (req, res) => {
	const { email, password } = req.body;

	const user = getUserByEmail(email);

	//Check to see the user info is correct
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

//LOGOUT
app.post("/logout", (req, res) => {
	res.clearCookie("user_id");
	res.redirect("/login");
});

//SHOW REGISTER PAGE
app.get("/register", (req, res) => {
	const userId = req.cookies.user_id;
	if (userId) {
		res.redirect("/urls");
	} else {
		res.render("register", { user: null });
	}
});

//REGISTER
app.post("/register", (req, res) => {
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
	res.cookie("user_id", newUser["id"]);
	res.redirect("/urls");
});

/////////////////////////////////////////////////////////////////////
// Listener
/////////////////////////////////////////////////////////////////////

app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});
