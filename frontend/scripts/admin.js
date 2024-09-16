import { AdminManagementAbi, AdminManagementAddress } from "./contractData.js";
import { ethers } from "./ethers-v6.13.2.min.js";

window.addNewAdmin = async function addNewAdmin(){
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
				
			}
		} catch (error) {
			console.log(error);
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
}


