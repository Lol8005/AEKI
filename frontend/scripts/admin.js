import {
	AdminManagementAbi,
	AdminManagementAddress,
	StockManagementAbi,
	StockManagementAddress,
	purchaseProductAbi,
	purchaseProductAddress,
	refundClientAbi,
	refundClientAddress,
	refundAdminAbi,
	refundAdminAddress,
} from "./contractData.js";
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

			const isAdmin = await adminContract.isAdmin(
				await (await signer).getAddress()
			);

			if (
				!isSuperAdmin &&
				window.location.pathname.split("/").at(-1) === "chairman.php"
			) {
				alert("You don't have the access to this page");

				if (isAdmin) {
					window.location.href = "stockManagement_list.php";
				} else {
					window.location.href = "index.php";
				}
			}

			if (
				!isSuperAdmin &&
				!isAdmin &&
				(window.location.pathname.split("/").at(-1) === "refund_admin.php" ||
					window.location.pathname.split("/").at(-1) === "stockManagement_add.php" ||
					window.location.pathname.split("/").at(-1) === "stockManagement_list.php" ||
					window.location.pathname.split("/").at(-1) === "transaction_status.php"
				)
			) {
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


//#region Admin Management

async function getAdminList() {
	if (typeof window.ethereum !== "undefined") {
		try {
			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();

			const accounts = await window.ethereum.request({
				method: "eth_requestAccounts",
			});

			const adminContract = new ethers.Contract(
				AdminManagementAddress,
				AdminManagementAbi,
				provider
			);

			const adminContractSigner = new ethers.Contract(
				AdminManagementAddress,
				AdminManagementAbi,
				signer
			);

			const adminList = await adminContract.viewAdminList();

			for (const admin of adminList[0]) {
				addNewAdminToTable(admin);
			}

			for (const admin of adminList[1]) {
				if (
					admin == "0x0000000000000000000000000000000000000000" ||
					admin == ""
				) {
					continue;
				}

				const root = document.getElementById(
					"resigned_admin_list_table"
				);
				// const tr = document.createElement("tr");
				// const td = document.createElement("td");

				// const address = document.createTextNode(admin);
				// td.appendChild(address);
				// tr.appendChild(td);
				// root.appendChild(tr);

				const tr = document.createElement("tr");
				// const td = document.createElement("td");

				const disableTime = epochToReadableDateConverter(
					(await adminContractSigner.admins(admin))[1]
				)

				console.log(disableTime);

				tr.innerHTML = `
					<td>${admin}</td>
					<td>${disableTime}</td>
					<td style="width: 20%">
						<button class="btn btn-warning text-center" onclick="adminTableResignButton('${admin}')">Modify</button>
						<button class="btn btn-success text-center" onclick="cancelAdminResignationBtn('${admin}')">Cancel</button>
					<td>
				`;

				//root.appendChild(tr.appendChild(td.appendChild(btn)));

				//td.appendChild(btn);
				//tr.appendChild(td);
				root.appendChild(tr);
			}

			for (const admin of adminList[2]) {
				if (
					admin == "0x0000000000000000000000000000000000000000" ||
					admin == ""
				) {
					continue;
				}

				const root = document.getElementById(
					"fired_admin_list_table"
				);

				const tr = document.createElement("tr");

				const disableTime = epochToReadableDateConverter(
					(await adminContractSigner.admins(admin))[1]
				)

				tr.innerHTML = `
					<td>${admin}</td>
					<td>${disableTime}</td>
				`;

				//root.appendChild(tr.appendChild(td.appendChild(btn)));

				//td.appendChild(btn);
				//tr.appendChild(td);
				root.appendChild(tr);
			}
		} catch (error) {
			alert("Transaction failed.");
			console.log(error);
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
}

if (window.location.pathname.split("/").at(-1) === "chairman.php") {
	getAdminList();
}

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

			const tx = await adminContract.registerNewAdmin(
				document.getElementById("adminAddress").value
			);

			await tx.wait();

			addNewAdminToTable(document.getElementById("adminAddress").value);
		} catch (error) {
			console.log(error);

			if (error.reason == "rejected") {
			} else {
				alert("Transaction failed.");
			}
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
};

function addNewAdminToTable(_address) {
	if (
		_address == "0x0000000000000000000000000000000000000000" ||
		_address == ""
	) {
		return;
	}

	const root = document.getElementById("admin_list_table");

	// const btn = document.createElement("button");
	// btn.className = "btn btn-light text-center";
	// btn.id = _address;
	// btn.style = "width: 100%";
	// btn.type = "button";
	// btn.innerHTML = _address;
	// btn.setAttribute("onclick", "activeAdminTableResignButton('" + _address + "')");

	const tr = document.createElement("tr");
	// const td = document.createElement("td");

	tr.innerHTML = `
		<td>${_address}</td>
		<td style="width: 20%"><button class="btn btn-danger text-center" onclick="adminTableResignButton('${_address}')">Resign</button><td>
	`;

	//root.appendChild(tr.appendChild(td.appendChild(btn)));

	//td.appendChild(btn);
	//tr.appendChild(td);
	root.appendChild(tr);
}

window.adminTableResignButton = async function adminTableResignButton(_address) {
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

				if (reply == null) return;

				if (reply == "0" || reply == "") {
					await adminContract.disableAdminAccess(_address, 0);
				} else {
					console.log("Resign Date: " + Date.parse(reply) / 1000);
					await adminContract.disableAdminAccess(
						_address,
						Date.parse(reply) / 1000
					);
				}
			} catch (error) {
				console.log(error);

				if (error.reason == "rejected") {
				} else {
					alert("Transaction failed.");
				}
			}
		} else {
			console.error("Browser wallet not detected!!!");
		}
	};

window.cancelAdminResignationBtn = async function cancelAdminResignationBtn(address){
	if (typeof window.ethereum !== "undefined") {
		try {
			const provider = new ethers.BrowserProvider(window.ethereum);

			const signer = await provider.getSigner();

			const adminContract = new ethers.Contract(
				AdminManagementAddress,
				AdminManagementAbi,
				signer
			);

			const tx = await adminContract.cancelResignation(address);

			await tx.wait();

			window.location.reload();

		} catch (error) {
			console.log(error);

			if (error.reason == "rejected") {
			} else {
				alert("Transaction failed.");
			}
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
}

//TODO: check admin access still there, if not revoke access
window.updateAdminAccess = async function updateAdminAccess() {
	if (typeof window.ethereum !== "undefined") {
		try {
			const provider = new ethers.BrowserProvider(window.ethereum);

			const signer = await provider.getSigner();

			const adminContract = new ethers.Contract(
				AdminManagementAddress,
				AdminManagementAbi,
				signer
			);

			await adminContract.finalizeDisable();
		} catch (error) {
			console.log(error);

			if (error.reason == "rejected") {
			} else {
				alert("Transaction failed.");
			}
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
};

//#endregion



//#region StockManagement

window.addNewProduct = async function addNewProduct() {
	if (typeof window.ethereum !== "undefined") {
		try {
			const name = document.getElementById("productName").value;
			const img = document.getElementById("productImage").files[0];
			const price = document.getElementById("price").value;
			const quantity = document.getElementById("quantity").value;
			const description = document.getElementById("description").value;
			const category = document.getElementById("category").value;
			const launch =
				Date.parse(document.getElementById("launchTime").value) / 1000;
			const discontinue =
				Date.parse(document.getElementById("discontinueTime").value) /
				1000;

			// await stockManagementContract.addNewProduct(
			// 	document.getElementById("adminAddress").value
			// );

			console.log(name);
			console.log(img);
			console.log(price);
			console.log(quantity);
			console.log(description);
			console.log(category);
			console.log(launch);
			console.log(discontinue);

			if (
				name == "" ||
				img == "" ||
				price == "" ||
				quantity == "" ||
				category == ""
			) {
				alert("Please fill in all the field with (*)!");
				return;
			}

			const formData = new FormData();
			formData.append("file", img);

			var imgCid;
			try {
				const response = await fetch("http://localhost:4000/upload", {
					method: "POST",
					body: formData,
				});

				if (!response.ok) {
					throw new Error("Failed to upload image");
				}

				const result = await response.json();
				imgCid = result.cid["/"]; // Assuming the API returns the CID in the response
				console.log(imgCid);
			} catch (error) {
				alert("Image upload failed.");
				console.log(error);
				return;
			}

			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();
			const stockManagementContract = new ethers.Contract(
				StockManagementAddress,
				StockManagementAbi,
				signer
			);

			const productHash = await stockManagementContract.addNewProduct(
				name,
				imgCid,
				price,
				quantity,
				description,
				category,
				isNaN(launch) ? 0 : launch,
				isNaN(discontinue) ? 0 : discontinue
			);

			console.log("Hash:" + JSON.stringify(productHash));

			alert("Successfully add new product!");
			//window.location.href = "stockManagement_list.php";
		} catch (error) {
			console.log(error);

			if (error.reason == "rejected") {
			} else {
				alert("Transaction failed.");
			}
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
};

window.clearAddProduct = async function clearAddProduct() {
	document.getElementById("productName").value = "";
	document.getElementById("productImage").value = "";
	document.getElementById("price").value = "";
	document.getElementById("quantity").value = "";
	document.getElementById("description").value = "";
	document.getElementById("category").value = "furniture";
	document.getElementById("launchTime").value = "";
	document.getElementById("discontinueTime").value = "";
};

async function getProductList() {
	if (typeof window.ethereum !== "undefined") {
		try {
			// Connect to Ethereum
			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();

			// Create an instance of the contract
			const stockManagementContract = new ethers.Contract(
				StockManagementAddress,
				StockManagementAbi,
				signer
			);

			// Fetch product lists
			const [onSaleProducts, goingToLaunchProducts, discontinueProducts] =
				await stockManagementContract.getProductList();

			// Update HTML table
			updateTable("active_product_list_table", onSaleProducts, "active");
			updateTable(
				"going_to_launch_product_list_table",
				goingToLaunchProducts,
				"launch"
			);
			updateTable(
				"discontinue_product_list_table",
				discontinueProducts,
				"discontinue"
			);
		} catch (error) {
			alert("Failed to fetch product data.");
			console.error(error);
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
}

function updateTable(tableId, products, status) {
	const tableBody = document.getElementById(tableId);

	products.forEach((product) => {
		const row = document.createElement("tr");

		if (status == "active") {
			row.innerHTML = `
            <td>${product.productName}</td>
            <td>RM ${product.price.toString()}</td>
            <td>${product.quantity.toString()}</td>
            <td>${getCategoryName(product.productCategory)}</td>
			<td>${
				Number(product.discontinueTime) == 0
					? NaN
					: epochToReadableDateConverter(new Date(Number(product.discontinueTime)))
			}</td>
            <td>
                <button class="btn btn-primary" onclick="updateQuantity('${
					product.productUniqueHash
				}')">Add Quantity</button>
				<button class="btn btn-success" onclick="resetDiscontinueTimeBtn('${
					product.productUniqueHash
				}')">Reset Discontinue Date</button>
                <button class="btn btn-danger" onclick="discontinueProduct('${
					product.productUniqueHash
				}')">Discontinue</button>
            </td>
        `;
		} else if (status == "launch") {
			row.innerHTML = `
            <td>${product.productName}</td>
            <td>RM ${product.price.toString()}</td>
            <td>${product.quantity.toString()}</td>
            <td>${getCategoryName(product.productCategory)}</td>
			<td>${
				Number(product.launchTime) == 0
					? NaN
					: epochToReadableDateConverter(new Date(Number(product.launchTime)))
			}</td>
            <td>
                <button class="btn btn-primary" onclick="updateQuantity('${
					product.productUniqueHash
				}')">Add Quantity</button>

                <button class="btn btn-warning" onclick="modifyLaunchTimeBtn('${
					product.productUniqueHash
				}')">Modify Launch Time</button>
				<button class="btn btn-danger" onclick="cancelLaunchBtn('${
					product.productUniqueHash
				}')">Cancel Launch</button>
            </td>
        `;
		} else {
			row.innerHTML = `
            <td>${product.productName}</td>
            <td>RM ${product.price.toString()}</td>
            <td>${getCategoryName(product.productCategory)}</td>
            <td>${epochToReadableDateConverter(new Date(Number(product.discontinueTime)))}</td>
        `;
		}

		tableBody.appendChild(row);
	});
}

if (window.location.pathname.split("/").at(-1) === "stockManagement_list.php") {
	getProductList();
}

window.updateQuantity = async function updateQuantity(uniqueHash) {
	if (typeof window.ethereum !== "undefined") {
		try {
			// Connect to Ethereum
			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();

			// Create an instance of the contract
			const stockManagementContract = new ethers.Contract(
				StockManagementAddress,
				StockManagementAbi,
				signer
			);

			const quantity = prompt("Restock quantity", "0");

			if (quantity == null) return;

			await stockManagementContract.restockProduct(uniqueHash, quantity);
		} catch (error) {
			console.log(error);

			if (error.reason == "rejected") {
			} else {
				alert("Transaction failed.");
			}
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
};

window.discontinueProduct = async function discontinueProduct(uniqueHash) {
	if (typeof window.ethereum !== "undefined") {
		try {
			// Connect to Ethereum
			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();

			// Create an instance of the contract
			const stockManagementContract = new ethers.Contract(
				StockManagementAddress,
				StockManagementAbi,
				signer
			);

			var discontinueTime = prompt(
				"Discontinue Date (Format: yyyy-MM-dd) \n 0 to discontinue now",
				0
			);

			if (discontinueTime == null) return;

			discontinueTime =
				discontinueTime == 0 ? 0 : Date.parse(discontinueTime) / 1000;

			console.log(discontinueTime);

			const tx = await stockManagementContract.setDiscontinueItem(
				uniqueHash,
				discontinueTime
			);

			await tx.wait();

			window.location.reload();

			// if (discontinueTime == 0) return;

			// try {
			// 	const response = await fetch("http://localhost:4000/setDiscontinuetime", {
			// 		method: "POST",
			// 		body: JSON.stringify({
			// 			productHash: uniqueHash,
			// 			executionTime: discontinueTime,
			// 			adminAddress: await (await signer).getAddress()
			// 		  }),
			// 		  headers: {
			// 			  "Content-Type": "application/json" // Specify that we're sending JSON
			// 		  }
			// 	});
			// } catch (error) {
			// 	console.log(error);
			// 	return;
			// }
		} catch (error) {
			console.log(error);

			if (error.reason == "rejected") {
			} else {
				alert("Transaction failed.");
			}
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
};

window.modifyLaunchTimeBtn = async function modifyLaunchTimeBtn(uniqueHash){
	if (typeof window.ethereum !== "undefined") {
		try {
			// Connect to Ethereum
			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();

			// Create an instance of the contract
			const stockManagementContract = new ethers.Contract(
				StockManagementAddress,
				StockManagementAbi,
				signer
			);

			var launchTime = prompt(
				"Launch Date (Format: yyyy-MM-dd) \n 0 to launch now",
				0
			);

			if (launchTime == null) return;

			launchTime = launchTime == 0 ? 0 : Date.parse(launchTime) / 1000;

			const tx = await stockManagementContract.modifyLaunchTime(
				uniqueHash,
				launchTime
			);

			await tx.wait();

			window.location.reload();

			// try {
			// 	const response = await fetch("http://localhost:4000/setLaunchtime", {
			// 		method: "POST",
			// 		body: JSON.stringify({
			// 			productHash: uniqueHash,
			// 			executionTime: launchTime,
			// 			adminAddress: await (await signer).getAddress()
			// 		  }),
			// 		  headers: {
			// 			  "Content-Type": "application/json" // Specify that we're sending JSON
			// 		  }
			// 	});
			// } catch (error) {
			// 	console.log(error);
			// 	return;
			// }
		} catch (error) {
			console.log(error);

			if (error.reason == "rejected") {
			} else {
				alert("Transaction failed.");
			}
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
};

window.updateProductStatus = async function updateProductStatus() {
	if (typeof window.ethereum !== "undefined") {
		try {
			// Connect to Ethereum
			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();

			// Create an instance of the contract
			const stockManagementContract = new ethers.Contract(
				StockManagementAddress,
				StockManagementAbi,
				signer
			);

			await stockManagementContract.updateLaunchStatus();
			await stockManagementContract.updateDiscontinueStatus();

			window.location.reload();
		} catch (error) {
			alert("Transaction failed.");
			console.log(error);
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
};

window.cancelLaunchBtn = async function cancelLaunchBtn(productHash){
	if (typeof window.ethereum !== "undefined") {
		try {
			// Connect to Ethereum
			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();

			// Create an instance of the contract
			const stockManagementContract = new ethers.Contract(
				StockManagementAddress,
				StockManagementAbi,
				signer
			);

			const tx = await stockManagementContract.cancelLaunch(productHash);
			await tx.wait();

			// try {
			// 	const response = await fetch("http://localhost:4000/cancelLaunch", {
			// 		method: "POST",
			// 		body: JSON.stringify({
			// 			productHash: productHash,
			// 			adminAddress: await (await signer).getAddress()
			// 		  }),
			// 		  headers: {
			// 			  "Content-Type": "application/json" // Specify that we're sending JSON
			// 		  }
			// 	});
			// } catch (error) {
			// 	console.log(error);
			// 	return;
			// }

			window.location.reload();
		} catch (error) {
			alert("Transaction failed.");
			console.log(error);
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
}

window.resetDiscontinueTimeBtn = async function resetDiscontinueTimeBtn(productHash){
	if (typeof window.ethereum !== "undefined") {
		try {
			// Connect to Ethereum
			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();

			// Create an instance of the contract
			const stockManagementContract = new ethers.Contract(
				StockManagementAddress,
				StockManagementAbi,
				signer
			);

			const tx = await stockManagementContract.resetDiscontinueTime(productHash);
			await tx.wait();

			// try {
			// 	const response = await fetch("http://localhost:4000/cancelDiscontinue", {
			// 		method: "POST",
			// 		body: JSON.stringify({
			// 			productHash: productHash,
			// 			adminAddress: await (await signer).getAddress()
			// 		  }),
			// 		  headers: {
			// 			  "Content-Type": "application/json" // Specify that we're sending JSON
			// 		  }
			// 	});
			// } catch (error) {
			// 	console.log(error);
			// 	return;
			// }

			window.location.reload();
		} catch (error) {
			alert("Transaction failed.");
			console.log(error);
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
}

//#endregion


//#region Trasaction Status Handler

window.getTransactionStatusData = async function getTransactionStatusData(){
	try {
		const response = await fetch(`http://localhost:4000/getAllTransactionStatus`);

		const result = await response.json();

		const queueBody = document.getElementById(
			"queue_transaction_status_list_table"
		);

		for (let index = result.queueProduct.length - 1; index >= 0; index--) {
			const queueItem = result.queueProduct[index];
			
			const row = document.createElement("tr");

			row.innerHTML = `
			<td>${StockManagementAddress.slice(0, 25)}.....</td>
			<td>${queueItem.functionCall}</td>
			<td>${epochToReadableDateConverter(queueItem.executionTime)}</td>
			<td>${queueItem.adminAddress.slice(0, 25)}.....</td>
			<td>${queueItem.productHash.slice(0, 25)}.....</td>
			`;

			queueBody.appendChild(row);
		}
		

		const executeBody = document.getElementById(
			"executed_transaction_status_list_table"
		);

		for (let index = result.executeProduct.length - 1; index >= 0 ; index--) {
			const executeItem = result.executeProduct[index];

			if (executeItem == null) return;
			
			const row = document.createElement("tr");

			row.innerHTML = `
			<td>${StockManagementAddress.slice(0, 25)}.....</td>
			<td>${executeItem.functionCall}</td>
			<td>${epochToReadableDateConverter(executeItem.executionTime)}</td>
			<td>${executeItem.adminAddress.slice(0, 25)}.....</td>
			<td>${executeItem.productHash.slice(0, 25)}.....</td>
			`;

			executeBody.appendChild(row);
		}


		const cancelBody = document.getElementById(
			"cancelled_transaction_status_list_table"
		);

		for (let index = result.cancelProduct.length - 1; index >= 0; index--) {
			const cancelItem = result.cancelProduct[index];

			if (cancelItem == null) return;
			
			const row = document.createElement("tr");

			row.innerHTML = `
			<td>${StockManagementAddress.slice(0, 25)}.....</td>
			<td>${cancelItem.functionCall}</td>
			<td>${epochToReadableDateConverter(cancelItem.executionTime)}</td>
			<td>${cancelItem.adminAddress.slice(0, 25)}.....</td>
			<td>${cancelItem.productHash.slice(0, 25)}.....</td>
			`;

			cancelBody.appendChild(row);
		}



		const queueAdminBody = document.getElementById(
			"queue_admin_transaction_status_list_table"
		);

		for (let index = result.queueAdmin.length - 1; index >= 0; index--) {
			const queueItem = result.queueAdmin[index];
			
			const row = document.createElement("tr");

			row.innerHTML = `
			<td>${AdminManagementAddress.slice(0, 25)}.....</td>
			<td>${queueItem.functionCall}</td>
			<td>${epochToReadableDateConverter(queueItem.executionTime)}</td>
			<td>${queueItem.admin.slice(0, 25)}.....</td>
			`;

			queueAdminBody.appendChild(row);
		}
		

		const executeAdminBody = document.getElementById(
			"executed_admin_transaction_status_list_table"
		);

		for (let index = result.executeAdmin.length - 1; index >= 0 ; index--) {
			const executeItem = result.executeAdmin[index];

			if (executeItem == null) return;
			
			const row = document.createElement("tr");

			row.innerHTML = `
			<td>${AdminManagementAddress.slice(0, 25)}.....</td>
			<td>${executeItem.functionCall}</td>
			<td>${epochToReadableDateConverter(executeItem.executionTime)}</td>
			<td>${executeItem.admin.slice(0, 25)}.....</td>
			`;

			executeAdminBody.appendChild(row);
		}


		const cancelAdminBody = document.getElementById(
			"cancelled_admin_transaction_status_list_table"
		);

		for (let index = result.cancelAdmin.length - 1; index >= 0; index--) {
			const cancelItem = result.cancelAdmin[index];

			if (cancelItem == null) return;
			
			const row = document.createElement("tr");

			row.innerHTML = `
			<td>${AdminManagementAddress.slice(0, 25)}.....</td>
			<td>${cancelItem.functionCall}</td>
			<td>${epochToReadableDateConverter(cancelItem.executionTime)}</td>
			<td>${cancelItem.admin.slice(0, 25)}.....</td>
			`;

			cancelAdminBody.appendChild(row);
		}
	} catch (error) {
		console.log(error);
	}
}

if (window.location.pathname.split("/").at(-1) === "transaction_status.php") {
	getTransactionStatusData();
}

//#endregion


//#region Refund

async function updateRequestRefundList() {
	if (typeof window.ethereum !== "undefined") {
		try {
			// Connect to Ethereum
			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();

			// Create an instance of the contract
			const refundClientContract = new ethers.Contract(
				refundClientAddress,
				refundClientAbi,
				provider
			);

			const requestRefunds =
				await refundClientContract.getRequestRefundProduct();

			const tableBody = document.getElementById(
				"request_refund_list_table"
			);
			for (let index = 0; index < requestRefunds.length; index++) {
				const refund = requestRefunds[index];

				const row = document.createElement("tr");

				row.innerHTML = `
				<td>${refund.user}</td>
				<td>${refund.purchaseHash.slice(0, 40)}......</td>
				<td>
					<button class="btn btn-primary" onclick="approveRefundRequest('${refund.purchaseHash}')">Approve</button>
					<button class="btn btn-danger" onclick="rejectRefundRequest('${refund.purchaseHash}')">Reject</button>
					<button class="btn btn-danger" onclick="banAccountRequestRefund('${refund.user}', '${refund.purchaseHash}')">Ban</button>
				</td>
				`;

				tableBody.appendChild(row);
			}
		} catch (error) {
			alert("Transaction failed.");
			console.log(error);
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
}

if (window.location.pathname.split("/").at(-1) === "refund_admin.php") {
	updateRequestRefundList();
}

window.approveRefundRequest = async function approveRefundRequest(
	_purchaseHash
) {
	if (typeof window.ethereum !== "undefined") {
		try {
			// Connect to Ethereum
			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();

			// Create an instance of the contract
			const refundAdminContract = new ethers.Contract(
				refundAdminAddress,
				refundAdminAbi,
				signer
			);

			const tx = await refundAdminContract.approveRejectRefund(
				_purchaseHash,
				3
			);
			await tx.wait();

			window.location.reload();
		} catch (error) {
			console.log(error);

			if (error.reason == "rejected") {
			} else {
				alert("Transaction failed.");
			}
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
};

window.rejectRefundRequest = async function rejectRefundRequest(_purchaseHash) {
	if (typeof window.ethereum !== "undefined") {
		try {
			// Connect to Ethereum
			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();

			// Create an instance of the contract
			const refundAdminContract = new ethers.Contract(
				refundAdminAddress,
				refundAdminAbi,
				signer
			);

			const tx = await refundAdminContract.approveRejectRefund(
				_purchaseHash,
				4
			);

			await tx.wait();

			window.location.reload();
		} catch (error) {
			console.log(error);

			if (error.reason == "rejected") {
			} else {
				alert("Transaction failed.");
			}
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
};

window.banAccountRequestRefund = async function rejectRefundRequest(
	user,
	_purchaseHash
) {
	if (typeof window.ethereum !== "undefined") {
		try {
			// Connect to Ethereum
			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();

			// Create an instance of the contract
			const refundAdminContract = new ethers.Contract(
				refundAdminAddress,
				refundAdminAbi,
				signer
			);

			let reason = prompt(
				"Why ban account " + user + " (leave empty to cancel)",
				""
			);

			if (reason == null || reason == "") return;

			const tx = await refundAdminContract.banAccount(
				user,
				_purchaseHash,
				reason
			);

			await tx.wait();

			window.location.reload();
		} catch (error) {
			console.log(error);

			if (error.reason == "rejected") {
			} else {
				alert("Transaction failed.");
			}
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
};

//#endregion



function epochToReadableDateConverter(epochTime) {
	const date = new Date(Number(epochTime) * 1000);

	// Extract date components
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
	const year = date.getFullYear();

	// Extract time components
	let hours = date.getHours();
	const minutes = String(date.getMinutes()).padStart(2, "0");
	const ampm = hours >= 12 ? "PM" : "AM";
	hours = hours % 12; // Convert to 12-hour format
	hours = hours ? String(hours).padStart(2, "0") : "12"; // The hour '0' should be '12'

	// Format the final date string
	return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
}

function getCategoryName(categoryIndex) {
	const categories = [
		"Furniture",
		"Storage",
		"Kitchen",
		"Decoration",
		"Others",
	];
	return categories[categoryIndex] || "Unknown";
}


