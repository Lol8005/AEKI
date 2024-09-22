import {
	StockManagementAbi,
	StockManagementAddress,
	purchaseProductAbi,
	purchaseProductAddress,
} from "./contractData.js";
import { ethers } from "./ethers-v6.13.2.min.js";

window.getUserPurchaseListJS = async function getUserPurchaseListJS() {
	if (typeof window.ethereum !== "undefined") {
		try {
			const provider = new ethers.BrowserProvider(window.ethereum);

			const purchaseProductContract = new ethers.Contract(
				purchaseProductAddress,
				purchaseProductAbi,
				provider
			);

			const signer = await provider.getSigner();

			const purchasedProducts =
				await purchaseProductContract.getUserPurchaseList(
					await (await signer).getAddress()
				);

			console.log(purchasedProducts);
			updatePurchasedProductList(purchasedProducts);


			const isBanned = await purchaseProductContract.isAccountBanned(await (await signer).getAddress());
			if(isBanned){
				const banInfo = await purchaseProductContract.banList_map(await (await signer).getAddress());

				alert(`Your account has been banned. \n Reason: ${banInfo[1]} \n Got banned at ${epochToReadableDateConverter(banInfo[0])} \n Purchase hash: ${banInfo[2]}`);
			}
		} catch (error) {
			alert("Transaction failed.");
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
};

connectToWallet();
getUserPurchaseListJS();

async function updatePurchasedProductList(purchasedProducts) {
	if (typeof window.ethereum !== "undefined") {
		try {
			const provider = new ethers.BrowserProvider(window.ethereum);

			// Create an instance of the contract
			const stockManagementContract = new ethers.Contract(
				StockManagementAddress,
				StockManagementAbi,
				provider
			);

			const tableBody = document.getElementById(
				"purchased_product_list_table"
			);

			for (let index = purchasedProducts.length - 1; 0 <= index; index--) {
				const product = purchasedProducts[index];

				//access public variable
				const productDetail = await stockManagementContract.product_map(
					product.productHash
				);

				const row = document.createElement("tr");

                var _action;
				// purchase
                if(product.purchaseStatus == 1){
                    _action = `
                        <button class="btn btn-danger" onclick="requestForRefund('${
                            product.purchaseHash
                        }')">Refund</button>
                    `
                }else if(product.purchaseStatus == 2){
					// refund proccessing
					_action = `
                        <button class="btn btn-warning" onclick="requestForCancel('${
                            product.purchaseHash
                        }')">Cancel refund</button>
                    `
				}else if(product.purchaseStatus == 3){
					// refunded
					_action = `
                        Refunded
                    `
				}else if(product.purchaseStatus == 4){
					// refunded
					_action = `
                        Request declined
                    `
				}else if(product.purchaseStatus == 5){
					// cancel refund
					_action = `
                        Refund cancelled
                    `
				}

				row.innerHTML = `
                    <td>${productDetail.productName}</td>
                    <td>RM ${productDetail.price.toString()}</td>
                    <td>${product.quantity.toString()}</td>
                    <td>${getCategoryName(productDetail.productCategory)}</td>
                    <td>${epochToReadableDateConverter(product.purchaseTime)}</td>
                    <td>
                        ${_action}
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

window.requestForRefund = async function requestForRefund(purchaseHash){
	if (typeof window.ethereum !== "undefined") {
		try {
			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();

			// Create an instance of the contract
			const purchaseProductContract = new ethers.Contract(
				purchaseProductAddress,
				purchaseProductAbi,
				signer
			);
			
			const tx = await purchaseProductContract.refundProduct(purchaseHash);

			await tx.wait();
			window.location.reload();
			
		} catch (error) {
			alert("Transaction failed.");
			console.log(error);
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
}

window.requestForCancel = async function requestForCancel(purchaseHash){
	if (typeof window.ethereum !== "undefined") {
		try {
			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();

			// Create an instance of the contract
			const purchaseProductContract = new ethers.Contract(
				purchaseProductAddress,
				purchaseProductAbi,
				signer
			);
			
			const tx = await purchaseProductContract.cancelRefund(purchaseHash);

			await tx.wait();
			window.location.reload();
			
		} catch (error) {
			alert("Transaction failed.");
			console.log(error);
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
}
