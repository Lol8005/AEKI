import { AdminManagementAbi, AdminManagementAddress } from "./contractData.js";
import { ethers } from "./ethers-v6.13.2.min.js";

async function checkGotAccess() {
	if (typeof window.ethereum !== "undefined") {
		try {
			const provider = new ethers.BrowserProvider(window.ethereum);

			const adminContract = new ethers.Contract(
				AdminManagementAddress,
				AdminManagementAbi,
				provider
			);

			document.getElementById("metamaskWalletButton").innerHTML =
				"Connected";
			document.getElementById("metamaskWalletButton").disabled = true;

			const signer = provider.getSigner();

			const isSuperAdmin = await adminContract.isSuperAdmin(
				await (await signer).getAddress()
			);

			if (!isSuperAdmin) {
				alert("You don't have the access to this page");
				window.location.href = "index.php";
			}
		} catch (error) {
			console.log(error);
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
}

checkGotAccess();

async function getAdminList() {
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

			const adminList = await adminContract.viewAdminList();

			for (const admin of adminList) {
				addNewAdminToTable(admin);
			}
		} catch (error) {
			alert("Transaction failed.");
			console.log(error);
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
}

getAdminList();

window.addNewAdmin = async function addNewAdmin() {
	if (typeof window.ethereum !== "undefined") {
		try {
			const provider = new ethers.BrowserProvider(window.ethereum);

			const accounts = await window.ethereum.request({
				method: "eth_requestAccounts",
			});

			const signer = await provider.getSigner();

			const adminContract = new ethers.Contract(
				AdminManagementAddress,
				AdminManagementAbi,
				signer
			);

			await adminContract.registerNewAdmin(
				document.getElementById("adminAddress").value
			);

			addNewAdminToTable(document.getElementById("adminAddress").value);
		} catch (error) {
			alert("Transaction failed.");
			console.log(error);
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
};

function addNewAdminToTable(_address) {
	const root = document.getElementById("admin_list_table");

	const btn = document.createElement("button");
	btn.className = "btn btn-light text-center";
	btn.id = _address;
	btn.style = "width: 100%";
	btn.type = "button";
	btn.innerHTML = _address;
	btn.setAttribute("onclick", "adminListTableBtn('" + _address + "')");

	const tr = document.createElement("tr");
	const td = document.createElement("td");

	//root.appendChild(tr.appendChild(td.appendChild(btn)));

	td.appendChild(btn);
	tr.appendChild(td);
	root.appendChild(tr);
}

window.adminListTableBtn = async function adminListTableBtn(_address) {
	if (typeof window.ethereum !== "undefined") {
		try {
			const provider = new ethers.BrowserProvider(window.ethereum);

			const signer = await provider.getSigner();

			const adminContract = new ethers.Contract(
				AdminManagementAddress,
				AdminManagementAbi,
				signer
			);

			let reply = prompt(
				"Resign Date (Format: yyyy-MM-dd) \n Enter 0 or blank to fired instantly",
				"0"
			);

			if (reply == null || reply == "0") {
                await adminContract.disableAdminAccess(
                    _address, 0
                );
			}else{
                console.log("Resign Date: " + Date.parse(reply));
                await adminContract.disableAdminAccess(
                    _address, Date.parse(reply)
                );
            }
		} catch (error) {
			alert("Transaction failed.");
			console.log(error);
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
};

//TODO: check admin access still there, if not revoke access
async function updateAdminAccess(){
    if (typeof window.ethereum !== "undefined") {
		try {
			const provider = new ethers.BrowserProvider(window.ethereum);

			const signer = await provider.getSigner();

			const adminContract = new ethers.Contract(
				AdminManagementAddress,
				AdminManagementAbi,
				signer
			);

			await adminContract.registerNewAdmin(
				document.getElementById("adminAddress").value
			);
		} catch (error) {
			alert("Transaction failed.");
			console.log(error);
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
}
