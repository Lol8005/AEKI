// source https://www.youtube.com/watch?v=gyMwXuJrbJQ
// time: 12:56:25

import { AdminManagementAbi, AdminManagementAddress } from "./contractData.js";
import { ethers } from "./ethers-v6.13.2.min.js";

window.connectToWallet = async function connectToWallet() {
	if (typeof window.ethereum !== "undefined") {
		try {
			const provider = new ethers.BrowserProvider(window.ethereum);

			const accounts = await window.ethereum.request({
				method: "eth_requestAccounts",
			});

			console.log("Connected accounts:", accounts);

			document.getElementById("metamaskWalletButton").innerHTML =
				"Connected";
			document.getElementById("metamaskWalletButton").disabled = true;

			//checkIsUserAdmin();
		} catch (error) {
			console.log(error);
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
};

window.checkIsUserAdmin = async function checkIsUserAdmin(){
	if (typeof window.ethereum !== "undefined") {
		try {
			const provider = new ethers.BrowserProvider(window.ethereum);

			const accounts = await window.ethereum.request({
				method: "eth_requestAccounts",
			});

			const adminContract = new ethers.Contract(
				AdminManagementAddress,
				AdminManagementAbi,
				provider
			);

			const signer = provider.getSigner();

			const isSuperAdmin = await adminContract.isSuperAdmin(await((await (signer)).getAddress()));

			if(isSuperAdmin){
				window.location.href = "chairman.php";
			}
		} catch (error) {
			console.log(error);
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
}


