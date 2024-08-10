// source https://www.youtube.com/watch?v=gyMwXuJrbJQ
// time: 12:56:25

async function connectToWallet() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
        } catch (error) {
            console.log(error);
        }

        document.getElementById("connectButton").innerHTML = "Connected";
        document.getElementById("connectButton").disabled = true;
    } else {
        console.error("Browser wallet not detected!!!");
    }
}
