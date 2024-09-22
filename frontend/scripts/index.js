import {
	StockManagementAbi,
	StockManagementAddress,
	purchaseProductAbi,
	purchaseProductAddress,
} from "./contractData.js";
import { ethers } from "./ethers-v6.13.2.min.js";

window.getProductListJs = async function getProductListJs() {
	if (typeof window.ethereum !== "undefined") {
		try {
			const provider = new ethers.BrowserProvider(window.ethereum);

			const accounts = await window.ethereum.request({
				method: "eth_requestAccounts",
			});

			const stockManagementContract = new ethers.Contract(
				StockManagementAddress,
				StockManagementAbi,
				provider
			);

			const [onSaleProducts, goingToLaunchProducts, _] =
				await stockManagementContract.getProductList();

			updateGoingToLaunchList(goingToLaunchProducts);

			var furnitureList = [];
			var storageList = [];
			var kitchenList = [];
			var decorationList = [];
			var othersList = [];

			for (let index = 0; index < onSaleProducts.length; index++) {
				const product = onSaleProducts[index];
				const productCategory = product.productCategory;

				if (productCategory == 0) {
					furnitureList.push(product);
				} else if (productCategory == 1) {
					storageList.push(product);
				} else if (productCategory == 2) {
					kitchenList.push(product);
				} else if (productCategory == 3) {
					decorationList.push(product);
				} else if (productCategory == 4) {
					othersList.push(product);
				} else {
					console.error("Invalid product category");
				}
			}

			updateOnSaleList(furnitureList, "Furniture");
			updateOnSaleList(storageList, "Storage");
			updateOnSaleList(kitchenList, "Kitchen");
			updateOnSaleList(decorationList, "Decoration");
			updateOnSaleList(othersList, "Others");
		} catch (error) {
			console.log(error)

			if(error.reason == "rejected") {

			}else{
				alert("Transaction failed.");
			}
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
};

connectToWallet();
getProductListJs();

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

async function updateGoingToLaunchList(goingToLaunchProducts) {
	const item_per_slide = 4;

	const GoingToLaunch = document.getElementById("GoingToLaunch-slide");

	// Clear previous items
	GoingToLaunch.innerHTML = "";

	// Create carousel items
	for (
		let i = 0;
		i < Math.ceil(goingToLaunchProducts.length / item_per_slide);
		i++
	) {
		const carouselItem = document.createElement("div");
		carouselItem.className = `carousel-item ${i === 0 ? "active" : ""}`;

		const rowDiv = document.createElement("div");
		rowDiv.className =
			"row row-cols-1 row-cols-md-4 g-4 mx-3 overflow-hidden";

		// Add product cards
		for (
			let j = 0;
			j < item_per_slide &&
			i * item_per_slide + j < goingToLaunchProducts.length;
			j++
		) {
			const product = goingToLaunchProducts[i * item_per_slide + j];

			const colDiv = document.createElement("div");
			colDiv.className = "col";

			const cardDiv = document.createElement("div");
			cardDiv.className = "card h-100";

			const imgElement = document.createElement("img");
			imgElement.src = await fetchImage(product.productIPFS_img_hash); // Ensure product has imgPath
			imgElement.className = "card-img-top border-bottom";
			imgElement.alt = product.title; // Ensure product has a title

			const cardBodyDiv = document.createElement("div");
			cardBodyDiv.className = "card-body";

			const titleElement = document.createElement("h5");
			titleElement.className = "card-title";
			titleElement.innerText =
				product.productName +
				` (${getCategoryName(product.productCategory)})`;

			const descriptionElement = document.createElement("p");
			descriptionElement.className = "card-text";
			descriptionElement.style.fontSize = ".85rem";
			descriptionElement.innerText = product.description;

			const timeElement = document.createElement("p");
			timeElement.className = "card-text text-end";
			timeElement.style.fontSize = ".7rem";
			timeElement.innerText =
				"Launch Time: " +
				epochToReadableDateConverter(product.launchTime);

			const footerDiv = document.createElement("div");
			footerDiv.className =
				"card-footer p-0 d-flex flex-row justify-content-between";

			const priceElement = document.createElement("p");
			priceElement.className = "h2 my-auto";
			priceElement.innerText = "RM " + product.price;

			const buttonElement = document.createElement("button");
			buttonElement.type = "button";
			buttonElement.className =
				"card-footer text-bg-primary btn py-0 px-5";
			buttonElement.style.fontSize = "1.25rem";
			buttonElement.style.borderBottomLeftRadius = "0";
			buttonElement.onclick = () => setReminderForUser(product.productUniqueHash); // Assuming addToCart is defined
			buttonElement.innerHTML = `<img src="assets/icon/reminder.png" height="30px" alt="reminder">`;

			// Assemble the card
			cardBodyDiv.appendChild(titleElement);
			cardBodyDiv.appendChild(descriptionElement);
			cardBodyDiv.appendChild(timeElement);
			cardDiv.appendChild(imgElement);
			cardDiv.appendChild(cardBodyDiv);
			footerDiv.appendChild(priceElement);
			footerDiv.appendChild(buttonElement);
			cardDiv.appendChild(footerDiv);
			colDiv.appendChild(cardDiv);
			rowDiv.appendChild(colDiv);
		}
		carouselItem.appendChild(rowDiv);
		GoingToLaunch.appendChild(carouselItem);
	}
}

async function updateOnSaleList(onSaleProducts, uniqueID) {
	const item_per_slide = 4;

	const OnSaleProductElement = document.getElementById(`${uniqueID}-slide`);

	// Clear previous items
	OnSaleProductElement.innerHTML = "";

	// Create carousel items
	for (
		let i = 0;
		i < Math.ceil(onSaleProducts.length / item_per_slide);
		i++
	) {
		const carouselItem = document.createElement("div");
		carouselItem.className = `carousel-item ${i === 0 ? "active" : ""}`;

		const rowDiv = document.createElement("div");
		rowDiv.className =
			"row row-cols-1 row-cols-md-4 g-4 mx-3 overflow-hidden";

		// Add product cards
		for (
			let j = 0;
			j < item_per_slide &&
			i * item_per_slide + j < onSaleProducts.length;
			j++
		) {
			const product = onSaleProducts[i * item_per_slide + j];

			const colDiv = document.createElement("div");
			colDiv.className = "col";

			const cardDiv = document.createElement("div");
			cardDiv.className = "card h-100";

			const imgElement = document.createElement("img");
			imgElement.src = await fetchImage(product.productIPFS_img_hash); // Ensure product has imgPath
			imgElement.className = "card-img-top border-bottom";
			imgElement.alt = product.title; // Ensure product has a title

			const cardBodyDiv = document.createElement("div");
			cardBodyDiv.className = "card-body";

			const titleElement = document.createElement("h5");
			titleElement.className = "card-title";
			titleElement.innerText = product.productName;

			const descriptionElement = document.createElement("p");
			descriptionElement.className = "card-text";
			descriptionElement.style.fontSize = ".85rem";
			descriptionElement.innerText = product.description;

			const quatityElement = document.createElement("p");
			quatityElement.className = "card-text text-end";
			quatityElement.style.fontSize = ".7rem";
			quatityElement.innerText = "Stock: " + product.quantity;

			const footerDiv = document.createElement("div");
			footerDiv.className =
				"card-footer p-0 d-flex flex-row justify-content-between";

			const priceElement = document.createElement("p");
			priceElement.className = "h2 my-auto";
			priceElement.innerText = "RM " + product.price;

            //if product out of stock, disable it
            const buttonElement = document.createElement("button");
			buttonElement.type = "button";
            buttonElement.style.fontSize = "1.25rem";
			buttonElement.style.borderBottomLeftRadius = "0";

            if(product.productStatus != 3){
			    buttonElement.className =
				"card-footer text-bg-primary btn py-0 px-5";
			    buttonElement.onclick = () => purchaseProduct(product.productUniqueHash);
			    buttonElement.innerHTML = `<img src="assets/icon/cart.png" height="30px" alt="cart">`;
            }else{
                buttonElement.className =
				"card-footer btn text-bg-danger py-0 px-5";
			    buttonElement.onclick = () => alert("Product out of stock");
			    buttonElement.innerHTML = `<img src="assets/icon/out-of-stock.png" height="30px" alt="out of stock">`;
            }
			

			// Assemble the card
			cardBodyDiv.appendChild(titleElement);
			cardBodyDiv.appendChild(descriptionElement);
			cardBodyDiv.appendChild(quatityElement);
			cardDiv.appendChild(imgElement);
			cardDiv.appendChild(cardBodyDiv);
			footerDiv.appendChild(priceElement);
			footerDiv.appendChild(buttonElement);
			cardDiv.appendChild(footerDiv);
			colDiv.appendChild(cardDiv);
			rowDiv.appendChild(colDiv);
		}
		carouselItem.appendChild(rowDiv);
		OnSaleProductElement.appendChild(carouselItem);
	}
}

async function fetchImage(cid) {
	const response = await fetch(`http://localhost:4000/retrieve/${cid}`);
	if (response.ok) {
		const blob = await response.blob();
		const imageUrl = URL.createObjectURL(blob);
		// const img = document.getElementById('fetchedImage');
		// img.src = imageUrl;
		// img.style.display = 'block'; // Show the image

		return imageUrl;
	} else {
		console.error("Failed to fetch image:", response.statusText);
	}
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

window.setReminderForUser = async function setReminderForUser(productHash) {
	if (typeof window.ethereum !== "undefined") {
		try {
			const provider = new ethers.BrowserProvider(window.ethereum);

			const signer = await provider.getSigner();

			const purchaseProductContract = new ethers.Contract(
				purchaseProductAddress,
				purchaseProductAbi,
				signer
			);

			await purchaseProductContract.setReminder(
				await (await signer).getAddress(),
				productHash
			);

			alert("We will send you an email when the time come.");
		} catch (error) {
			console.log(error)

			if(error.reason == "rejected") {

			}else{
				alert("Transaction failed.");
			}
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
};

window.purchaseProduct = async function purchaseProduct(productHash) {
	if (typeof window.ethereum !== "undefined") {
		try {
			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();

            const stockManagementContract = new ethers.Contract(
				StockManagementAddress,
				StockManagementAbi,
				provider
			);

			const purchaseProductContract = new ethers.Contract(
				purchaseProductAddress,
				purchaseProductAbi,
				signer
			);

            console.log(productHash)

			var quantity = prompt("Please enter quantity", 0);

			if (quantity == null || quantity == "" || quantity <= 0) {
				return;
			}

            const ethPriceMYR = BigInt(10881);
            const amountToSend = ethers.parseEther((Number(await stockManagementContract.returnProductPrice(productHash)) * Number(quantity)) + "") / ethPriceMYR;

			const tx = await purchaseProductContract.userPurchaseProduct(productHash, quantity, { value: amountToSend });

            await tx.wait();
            alert('Transaction Confirmed:', tx);

			window.location.href = "my_purchase.php";
		} catch (error) {
			console.log(error)

			if(error.reason == "rejected") {

			}else{
				alert("Transaction failed.");
			}
		}
	} else {
		console.error("Browser wallet not detected!!!");
	}
};
