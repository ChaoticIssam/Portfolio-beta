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
			}, 0.5);//change it to 20 when you are done
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