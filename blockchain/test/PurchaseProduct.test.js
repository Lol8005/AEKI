const { ethers } = require("ethers");
const PurchaseProduct = artifacts.require("PurchaseProduct");
const StockManagement = artifacts.require("StockManagement");
const AdminManagement = artifacts.require("AdminManagement");
const { expectRevert, time } = require('@openzeppelin/test-helpers');

contract("PurchaseProduct", (accounts) => {
    let purchaseProduct;
    let stockManagement;
    let adminManagement;

    const superAdmin = accounts[0];
    const admin1 = accounts[1];
    const buyer = accounts[2];
    const refundClient = accounts[3];
    const refundAdmin = accounts[4];

    const productHash = web3.utils.keccak256("SampleProduct");
    const productPrice = web3.utils.toWei("1", "ether"); // 1 Ether
    const quantity = 2;

    // "before all" hook
    before(async () => {
        adminManagement = await AdminManagement.new();
        stockManagement = await StockManagement.new(adminManagement.address);
        purchaseProduct = await PurchaseProduct.new(stockManagement.address, adminManagement.address);

        // Register admin and set refund addresses
        await adminManagement.registerNewAdmin(admin1, { from: superAdmin });
        await purchaseProduct.setRefundAddress(refundClient, refundAdmin, { from: admin1 });

        // Set up the product in stockManagement
        await stockManagement.addNewProduct("SampleProduct", "ipfs://img_hash", productPrice, 100, "Sample product", 0, 0, 0, { from: admin1 });
    });

    describe("Deployment", () => {
        it("should deploy the contract with correct addresses", async () => {
            assert.equal(await purchaseProduct.superAdmin(), superAdmin);
            assert.equal(await purchaseProduct.stockManagement(), stockManagement.address);
            assert.equal(await purchaseProduct.adminManagement(), adminManagement.address);
        });
    });

    describe("Purchase Functionality", () => {
        it("should allow user to purchase product successfully", async () => {
            const totalCost = ethers.BigNumber.from(productPrice).mul(quantity); // Calculate total cost correctly

            const tx = await purchaseProduct.userPurchaseProduct(productHash, quantity, { from: buyer, value: totalCost });
            const purchaseEvent = tx.logs[0].args;

            assert.equal(purchaseEvent.user, buyer);
            assert.equal(purchaseEvent.productHash, productHash);
            assert.equal(purchaseEvent.quantity.toString(), quantity.toString());

            const purchaseRecord = await purchaseProduct.getUserPurchaseList(buyer);
            assert.equal(purchaseRecord.length, 1);
            assert.equal(purchaseRecord[0].productHash, productHash);
        });

        it("should revert if insufficient ether is sent", async () => {
            const insufficientValue = ethers.BigNumber.from(productPrice).mul(quantity - 1); // One less than the required amount
            await expectRevert(
                purchaseProduct.userPurchaseProduct(productHash, quantity, { from: buyer, value: insufficientValue }),
                "Don't enough eth to proccess transaction"
            );
        });
    });

    describe("Refund Functionality", () => {
        // Additional tests for refund functionality can go here
    });

    describe("Reminder Functionality", () => {
        // Additional tests for reminder functionality can go here
    });

    // Add more test cases as needed...
});
