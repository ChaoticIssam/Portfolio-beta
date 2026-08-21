export class BIOSLoading {
	constructor(){
		this.currentdate = null;
		this.timeInMilliseconds = null;
		this.messages = [
			"ISSAM RELEASED,				      07/25/2001",
			"STUDYING SOFTWARE ENGINEERING 2022-2024 AT LEET AKA 1337",
			"CHECKING FOR POTATO PCS:		        14000 OK",
			"READY TO LOAD PORTFOLIO",
			"LOADING RESOURCES...",
			"LOADING 3D MODELS... 53%",
			"LOADING TEXTURES... 67%",
			"LOADING SOUNDS... 71%",
			"LOADING IMAGES... 89%",
			"LOADING FONTS... 92%",
			"LOADING SCRIPTS... 100%",
			"ALL RESOURCES LOADED SUCCESSFULLY.",
		];
		this.currentMessageIndex = 0;
		this.biosMessagesElement = document.getElementById("biosMessages");
		this.progressBarElement = document.getElementById("progressBar");
	}
	displayMessage(message){
		return new Promise((resolve) => {
			let i = 0;
			this.currentdate = new Date();
			this.timeInMilliseconds =">" + this.currentdate.getHours().toString().padStart(2, "0") + ":" 
			+ this.currentdate.getMinutes().toString().padStart(2, "0") + ":" + this.currentdate.getSeconds().toString().padStart(2, "0");
			message = `${this.timeInMilliseconds} : ${message}`;
			const interval = setInterval(() => {
				this.biosMessagesElement.textContent += message[i];
				i++;
				if (i === message.length) {
					clearInterval(interval);
					this.biosMessagesElement.textContent += "\n";
					resolve();
				}
			}, 20); // Fixed from 0.5ms to 20ms
		});
	}
	async start(){
		for (const message of this.messages) {
			await this.displayMessage(message);
		}
		// Hide the BIOS screen after messages complete
		const biosScreen = document.getElementById('biosScreen');
		if (biosScreen) {
			setTimeout(() => {
				biosScreen.style.display = 'none';
			}, 1000);
		}
		// Safety timeout - ensure loading finishes within 15 seconds max
		return new Promise((resolve) => {
			setTimeout(() => resolve(), 3000);
		});
	}
}