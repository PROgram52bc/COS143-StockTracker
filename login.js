var statesEnum = 
{
	loggedOut: 0,
	loggedIn: 1,
	loggedInAdmin: 2
};
changeState(statesEnum.loggedOut);
var currentUser = "";
var usernameValid = false;
var passwordValid = false;

/******************************Log in/out Functions************************************/
function login(u,pw) {
	var xhr = new XMLHttpRequest();
	xhr.responseType = "json";
	xhr.addEventListener("load", function() {
		console.log("logging in");
		console.dir(this.response);
		messageLogin.innerHTML = this.response[0].message;
		if (this.response[0].status)
		{
			currentUser = this.response[0].username;
			if (u == "admin")
			{
				changeState(statesEnum.loggedInAdmin);
			}
			else
			{
				changeState(statesEnum.loggedIn);
			}
		}
	});
	xhr.addEventListener("error", function() {
		console.log("error");
		console.log(this.status);
	});
	xhr.open("POST", "https://cse.taylor.edu/~cos143/sessions.php");
	xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	xhr.send("Name="+u+"&Password="+pw);
}

function logout() {
	var xhr = new XMLHttpRequest();
	xhr.responseType = "json";
	xhr.addEventListener("load", function() {
		console.log("peacing out~");
		console.dir(this.response);
		messageLogin.innerHTML = this.response[0].message;
		if (this.response[0].status)
			currentUser = "";
			changeState(statesEnum.loggedOut);
	});
	xhr.addEventListener("error", function() {
		console.log("error");
		console.log(this.status);
	});
	xhr.open("POST", "https://cse.taylor.edu/~cos143/sessions.php");
	xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	xhr.send("method=delete");
}

function create(u, pw) {
	var xhr = new XMLHttpRequest();
	xhr.responseType = "json";
	xhr.addEventListener("load", function() {
		console.log("creating a new account");
		console.dir(this.response);
		messageLogin.innerHTML = this.response[0].message;
	});
	xhr.addEventListener("error", function() {
		console.log("error");
		console.log(this.status);
	});
	xhr.open("POST", "https://cse.taylor.edu/~cos143/users.php");
	xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	xhr.send("Name="+u+"&Password="+pw);
}

function update(u, pw) {
	var xhr = new XMLHttpRequest();
	xhr.responseType = "json";
	xhr.addEventListener("load", function() {
		console.log("Changing password");
		console.dir(this.response);
		messageLogin.innerHTML = this.response[0].message;
	});
	xhr.addEventListener("error", function() {
		console.log("error");
		console.log(this.status);
	});
	xhr.open("POST", "https://cse.taylor.edu/~cos143/users.php");
	xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	xhr.send("method=put&Name="+u+"&Password="+pw);
}

function getAll() {
	var xhr = new XMLHttpRequest();
	xhr.responseType = "json";
	xhr.addEventListener("load", function() {
		console.log("checking account");
		console.dir(this.response);
		accountlist.innerHTML = "";
		for (var i=1;i<this.response.length;i++)
		{
			var account = document.createElement("li");
			account.innerHTML = this.response[i].ID + "---" + this.response[i].Name;
			accountlist.appendChild(account);
		}
		messageLogin.innerHTML = this.response[0].message;
	});
	xhr.addEventListener("error", function() {
		console.log("error");
		console.log(this.status);
	});
	xhr.open("GET", "https://cse.taylor.edu/~cos143/users.php");
	xhr.send();
}

function del(u) {
	var xhr = new XMLHttpRequest();
	xhr.responseType = "json";
	xhr.addEventListener("load", function() {
		console.log("deleting account");
		console.dir(this.response);
		messageLogin.innerHTML = this.response[0].message;
	});
	xhr.addEventListener("error", function() {
		console.log("error");
		console.log(this.status);
	});
	xhr.open("POST", "https://cse.taylor.edu/~cos143/users.php");
	xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	xhr.send("method=delete&Name="+u);
}

function submitCheck(func, noUsername = false, noPassword = false)
{
	if ((noPassword || passwordValid) && (noUsername || usernameValid))
		func(username.value, password.value); 
	else
		if (!passwordValid && !noPassword)
		{
			password.classList.add("invalid");
			password.classList.remove("valid");
			passwordNotice.innerHTML = "Use a valid password.";
		}
		if (!usernameValid && !noUsername)
		{
			username.classList.add("invalid");
			username.classList.remove("valid");
			usernameNotice.innerHTML = "Use a valid username.";
		}
};



/******************************State Function************************************/
function changeState(n) {
	username.classList.remove("valid");
	username.classList.remove("invalid");
	password.classList.remove("valid");
	password.classList.remove("invalid");
	usernameValid = false;
	passwordValid = false;
	username.value = "";
	password.value = "";
	accountlist.innerHTML = "";
	usernameNotice.innerHTML = passwordNotice.innerHTML = "";
	var elements = document.getElementsByClassName("state");
	switch(n) {
		case statesEnum.loggedOut:
			console.log("loggedOut");
			messageLogin.innerHTML = "Login to continue";
			for (var i=0;i<elements.length;i++)
			{
				if (elements[i].classList.contains("logout"))
				{
					elements[i].classList.remove("hidden")
				}
				else 
				{
					elements[i].classList.add("hidden");
				}
			}
			/* ^^^^^ Replaced by ^^^^^
			logoutButton.classList.add("hidden");
			loginButton.classList.remove("hidden");
			createButton.classList.remove("hidden");
			updateButton.classList.add("hidden");
			deleteButton.classList.add("hidden");
			username.classList.remove("hidden");
			username.previousElementSibling.classList.remove("hidden");
			checkAll.classList.add("hidden");
			*/
			state.innerHTML = "State: logged out";
			break;
		case statesEnum.loggedInAdmin:
			console.log("loggedIn as admin");
			for (var i=0;i<elements.length;i++)
			{
				if (elements[i].classList.contains("admin"))
				{
					elements[i].classList.remove("hidden")
				}
				else 
				{
					elements[i].classList.add("hidden");
				}
			}
			state.innerHTML = "State: logged in as "+currentUser;
			break;
		case statesEnum.loggedIn:
			console.log("loggedIn");
			for (var i=0;i<elements.length;i++)
			{
				if (elements[i].classList.contains("login"))
				{
					elements[i].classList.remove("hidden")
				}
				else 
				{
					elements[i].classList.add("hidden");
				}
			}
			state.innerHTML = "State: logged in as "+currentUser;
			break;
		default:
			console.warn("state does not exist.");
	}
}

/******************************Form validator functions************************************/

function checkUsername(e) {
	if (/^[A-Za-z0-9]{4,6}$/.test(this.value))
	{
		usernameValid = true;
		username.classList.add("valid");
		username.classList.remove("invalid");
		usernameNotice.innerHTML = "&#9786; Username OK";
	}
	else
	{
		usernameValid = false;
		username.classList.add("invalid");
		username.classList.remove("valid");
		usernameNotice.innerHTML = "&#9785; Bad Username";
	}
}

function checkPassword(e) {
	if (/^[A-Za-z0-9]{4,6}$/.test(this.value))
	{
		passwordValid = true;
		password.classList.add("valid");
		password.classList.remove("invalid");
		passwordNotice.innerHTML = "&#9786; Password OK";
	}
	else
	{
		passwordValid = false;
		password.classList.add("invalid");
		password.classList.remove("valid");
		passwordNotice.innerHTML = "&#9785; Bad Password";
	}
}

/******************************Event Listeners************************************/

loginButton.addEventListener("click", function() {
	submitCheck(()=>{login(username.value, password.value);});
			});
logoutButton.addEventListener("click", logout);
createButton.addEventListener("click", function() {
	submitCheck(()=>{create(username.value, password.value);});
		});
updateButton.addEventListener("click", function() { 
	if (currentUser == "admin") // if admin, allow updating for any user
		submitCheck(()=>{update(username.value, password.value);});
	else if (currentUser != "") // anything else, updating for itself only
		submitCheck(()=>{update(username.value, password.value);}, true);
	else { console.log("Not logged in, cannot update password"); }
});
	
deleteButton.addEventListener("click", function() {
	if (currentUser == "admin") // possible only when admin
	{
		submitCheck(()=>{del(username.value);},false,true); // only check user name
	}
	else
		console.warn("Not admin, cannot delete accounts.");
});
checkAll.addEventListener("click", getAll);
username.addEventListener("input", checkUsername);
password.addEventListener("input", checkPassword);

