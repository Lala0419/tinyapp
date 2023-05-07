/////////////////////////////////////////////////////////////////////
// Requires
/////////////////////////////////////////////////////////////////////

const express = require("express");
const cookieSession = require("cookie-session");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const {
	getUserByEmail,
	generateRandomString,
	urlsForUser,
} = require("./helpers");
/////////////////////////////////////////////////////////////////////
// Initialization
/////////////////////////////////////////////////////////////////////

const app = express();
const PORT = 8080;

/////////////////////////////////////////////////////////////////////
// Configuration
/////////////////////////////////////////////////////////////////////

app.set("view engine", "ejs");

/////////////////////////////////////////////////////////////////////
// Middleware
/////////////////////////////////////////////////////////////////////

app.use(express.urlencoded({ extended: true }));
app.use(
	cookieSession({
		name: "session",
		keys: ["key1", "key2"],

		// Cookie Options
		maxAge: 24 * 60 * 60 * 1000, // 24 hours
	})
);
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
// Routes
/////////////////////////////////////////////////////////////////////

//SHOW RANDING PAGE
app.get("/urls", (req, res) => {
	const userId = req.session.user_id;
	const userURL = urlsForUser(userId, urlDatabase);
	const templateVars = {
		user: users[req.session.user_id],
		urls: userURL,
	};
	res.render("urls_index", templateVars);
});

//SHOW NEW OR LOGIN PAGE
app.get("/urls/new", (req, res) => {
	const userId = req.session.user_id;
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
	//Chech to see if the current loggedin user owns the URL
	if (urlDatabase[req.params.id].userID !== req.session.user_id) {
		return res.status(403).send("This URL does not belong to you!");
	}
	const templateVars = {
		user: users[req.session.user_id],
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
	const userID = req.session.user_id;

	//Check to see if use is loggedin
	if (userID) {
		urlDatabase[id] = {
			longURL,
			userID,
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

	//Check to see if the URL exists
	if (longURL) {
		res.redirect(longURL);
	} else {
		res.status(404).send("Short URL not found");
	}
});

//DELETE URL
app.post("/urls/:id/delete", (req, res) => {
	const shortURL = req.params.id;
	const userID = req.session.user_id;

	//Check to see if the shortURL exists in database
	if (urlDatabase.hasOwnProperty(shortURL)) {
		const url = urlDatabase[shortURL];

		//check to see if the user and the ower of the URL matches
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
	const userID = req.session.user_id;

	//Check to see if the shortURL exists in database
	if (urlDatabase.hasOwnProperty(shortURL)) {
		const url = urlDatabase[shortURL];

		//check to see if the user and the ower of the URL matches
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
	const userId = req.session.user_id;

	//Check to see if the user ID exists
	if (userId) {
		res.redirect("/urls");
	} else {
		res.render("login", { user: null });
	}
});

//LOGIN
app.post("/login", (req, res) => {
	const { email, password } = req.body;
	const user = getUserByEmail(email, users);
	const readPassword = bcrypt.compareSync(password, user.password);

	//Check to see the user info is correct
	if (!user) {
		res
			.status(403)
			.send(
				"Email adress was not found... Please check the spelling and try again!"
			);
	} else if (!readPassword) {
		res
			.status(403)
			.send("Password was Invalid... Please check the spelling and try again!");
	} else {
		req.session.user_id = user.id;
		res.redirect("/urls");
	}
});

//LOGOUT
app.post("/logout", (req, res) => {
	req.session = null;
	res.redirect("/login");
});

//SHOW REGISTER PAGE
app.get("/register", (req, res) => {
	const userId = req.session.user_id;
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
	console.log(`req.body: ${email}, ${password}`);
	const hashedPassword = bcrypt.hashSync(password, 10);
	console.log(hashedPassword);

	// Check if email or password are empty
	if (!email || !hashedPassword) {
		res.status(400).send("Email and password cannot be empty");
		return;
	}

	// Check if email is already registered
	if (getUserByEmail(email, users)) {
		res.status(400).send("Email already registered");
		return;
	}

	//Create a new user object
	const newUser = {
		id,
		email,
		password: hashedPassword,
	};
	users[id] = newUser;
	req.session.user_id = newUser["id"];
	res.redirect("/urls");
});

/////////////////////////////////////////////////////////////////////
// Listener
/////////////////////////////////////////////////////////////////////

app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});
