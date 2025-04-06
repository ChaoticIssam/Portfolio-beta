export class Login{
	constructor(){
		this.loginButton = document.getElementById("loginButton");
		this.username = document.getElementById("username");
		this.bindEvents();
	}
	bindEvents(){
		this.loginButton.addEventListener("click", this.login.bind(this));
	}
	login(){
		alert(`Welcome ${this.username.value}`);
	}
}