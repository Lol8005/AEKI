const StockManagement = artifacts.require("StockManagement");
const AdminManagement = artifacts.require("AdminManagement");
const { expectRevert, time } = require('@openzeppelin/test-helpers');

contract("StockManagement", (accounts) => {
    let stockManagement;
    let adminManagement;

    const superAdmin = accounts[0];
    const admin1 = accounts[1];
    const admin2 = accounts[2];

    before(async () => {
        adminManagement = await AdminManagement.new();
        stockManagement = await StockManagement.new(adminManagement.address);

        // Register an admin
        await adminManagement.registerNewAdmin(admin1, { from: superAdmin });
    });

    describe("Admin Functions", () => {
        it("should allow active admin to add new product", async () => {
            // Call the function and get the transaction receipt
            const tx = await stockManagement.addNewProduct(
                "Chair",
                "ipfs://img_hash",
                100,
                10,
                "Comfortable chair",
                0, // ProductCategory not used here
                0, // Launch time
                0  // Discontinue time
            );

            const productHash = tx.logs[0].args.productHash; // Retrieve the product hash from the emitted event

            const product = await stockManagement.product_map(productHash);
            assert.equal(product.productName, "Chair");
            assert.equal(product.price.toString(), "100");
            assert.equal(product.quantity.toString(), "10");
            assert.equal(product.productStatus.toString(), "2"); // Active
        });

        it("should not allow inactive admin to add product", async () => {
            await expectRevert(
                stockManagement.addNewProduct(
                    "Table",
                    "ipfs://img_hash",
                    200,
                    5,
                    "Wooden table",
                    0,
                    0,
                    0,
                    { from: admin2 }
                ),
                "Only active admins can perform this action"
            );
        });

        it("should allow active admin to restock product", async () => {
            const tx = await stockManagement.addNewProduct(
                "Table",
                "ipfs://img_hash",
                200,
                5,
                "Wooden table",
                0,
                0,
                0,
                { from: admin1 }
            );

            const productHash = tx.logs[0].args.productHash;

            await stockManagement.restockProduct(productHash, 10, { from: admin1 });
            const product = await stockManagement.product_map(productHash);
            assert.equal(product.quantity.toString(), "15");
        });

        it("should not allow restocking of a non-existent product", async () => {
            const fakeHash = web3.utils.keccak256("FakeProduct");
            await expectRevert(
                stockManagement.restockProduct(fakeHash, 10, { from: admin1 }),
                "Product Not Available"
            );
        });
    });

    describe("Product Management", () => {
        it("should allow setting a discontinue time", async () => {
            const tx = await stockManagement.addNewProduct(
                "Sofa",
                "ipfs://img_hash",
                300,
                3,
                "Comfortable sofa",
                0,
                0,
                0,
                { from: admin1 }
            );
        
            const productHash = tx.logs[0].args.productHash;
        
            // Set discontinue time to the current timestamp
            const currentTime = (await time.latest()).add(time.duration.seconds(3)).toString();
            
            await stockManagement.setDiscontinueItem(productHash, currentTime, { from: admin1, gas: 500000 });
        
            // Update the discontinue status immediately
            await new Promise(resolve => setTimeout(resolve, 4000));
            await stockManagement.updateDiscontinueStatus({gas: 500000 });
        
            const product = await stockManagement.product_map(productHash);
        
            // Ensure the product status is set to Discontinue (status = 4)
            assert.equal(product.productStatus.toString(), "4"); // Discontinue
        });
        

        it("should allow updating launch status", async () => {
            const tx = await stockManagement.addNewProduct(
                "Lamp",
                "ipfs://img_hash",
                50,
                20,
                "Table lamp",
                0,
                (await time.latest()).add(time.duration.days(1)), // Future launch time
                0,
                { from: admin1 }
            );

            const productHash = tx.logs[0].args.productHash;

            await time.increase(time.duration.days(2)); // Move time forward
            await stockManagement.updateLaunchStatus({ from: superAdmin });
            const product = await stockManagement.product_map(productHash);
            assert.equal(product.productStatus.toString(), "2"); // Active
        });
    });

    describe("Error Handling", () => {
        it("should not allow setting an invalid discontinue time", async () => {
            const tx = await stockManagement.addNewProduct(
                "Shelf",
                "ipfs://img_hash",
                150,
                8,
                "Bookshelf",
                0,
                0,
                0,
                { from: admin1 }
            );

            const productHash = tx.logs[0].args.productHash;

            await expectRevert(
                stockManagement.setDiscontinueItem(productHash, (await time.latest()).sub(time.duration.days(1)), { from: admin1 }),
                "Invalid discontinue time"
            );
        });

        it("should not allow an inactive admin to modify products", async () => {
            const tx = await stockManagement.addNewProduct(
                "Cup",
                "ipfs://img_hash",
                25,
                50,
                "Coffee cup",
                0,
                0,
                0,
                { from: admin1 }
            );

            const productHash = tx.logs[0].args.productHash;

            await expectRevert(
                stockManagement.cancelLaunch(productHash, { from: admin2 }),
                "Only active admins can perform this action"
            );
        });
    });

    describe("Product Queries", () => {
        it("should return product launch time", async () => {
            const tx = await stockManagement.addNewProduct(
                "Mug",
                "ipfs://img_hash",
                30,
                100,
                "Tea mug",
                0,
                0,
                0,
                { from: admin1 }
            );

            const productHash = tx.logs[0].args.productHash;

            const launchTime = await stockManagement.returnProductLaunchTime(productHash);
            assert.equal(launchTime.toString(), "0"); // Launch time is 0
        });

        it("should return product price", async () => {
            const tx = await stockManagement.addNewProduct(
                "Plate",
                "ipfs://img_hash",
                10,
                150,
                "Dinner plate",
                0,
                0,
                0,
                { from: admin1 }
            );

            const productHash = tx.logs[0].args.productHash;

            const price = await stockManagement.returnProductPrice(productHash);
            assert.equal(price.toString(), "10"); // Price should be 10
        });
    });
});
