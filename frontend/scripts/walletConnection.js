// source https://www.youtube.com/watch?v=gyMwXuJrbJQ
// time: 12:56:25

async function connectToWallet() {
	if (typeof window.ethereum !== "undefined") {
		try {
			await window.ethereum.request({ method: "eth_requestAccounts" });
			document.getElementById("connectButton").innerHTML = "Connected";
			document.getElementById("connectButton").disabled = true;
		} catch (error) {
			console.log(error);
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
}
