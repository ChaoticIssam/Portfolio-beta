export class BIOSLoading {
	constructor(){
		this.messages = [
			"Issam Released,				      07/25/2001",
			"Studying Software Engineering 2022-2024 at LEET aka 1337",
			"Checking For Potato PCs:		        14000 OK",
			"Ready To Load Portfolio",
			"LOADING RESOURCES...",
			"Loading 3D Models... 53%",
			"Loading Textures... 67%",
			"Loading Sounds... 71%",
			"Loading Images... 89%",
			"Loading Fonts... 92%",
			"Loading Scripts... 100%",
			"All Resources Loaded Successfully.",
		];
		this.currentMessageIndex = 0;
		this.biosMessagesElement = document.getElementById("biosMessages");
		this.progressBarElement = document.getElementById("progressBar");
	}
	displayMessage(message){
		return new Promise((resolve) => {
			let i = 0;
			const interval = setInterval(() => {
				this.biosMessagesElement.textContent += message[i];
				i++;
				if (i === message.length) {
					clearInterval(interval);
					this.biosMessagesElement.textContent += "\n";
					resolve();
				}
			}, 10);
		});
	}
	async start(){
		for (const message of this.messages) {
			await this.displayMessage(message);
		}
		setTimeout(() => {
			document.getElementById('biosScreen').style.display = 'none';
		}, 2000);
	}
}