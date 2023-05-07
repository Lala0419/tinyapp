/////////////////////////////////////////////////////////////////////
// Helper functions
/////////////////////////////////////////////////////////////////////

// To get user object by email
const getUserByEmail = (email, database) => {
	for (const userId in database) {
		if (database[userId].email === email) {
			return database[userId];
		}
	}
	return null;
};

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

//To get return URLs where userID equals id of logged in user
const urlsForUser = function (id, urlDatabase) {
	const filteredUrls = {};
	for (const url in urlDatabase) {
		console.log(urlDatabase, urlDatabase[url]);
		if (urlDatabase[url].userID === id) {
			filteredUrls[url] = urlDatabase[url];
		}
	}
	console.log(`filteredUrls: ${filteredUrls}`);
	return filteredUrls;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };
