module.exports = async function (deployer) {
    // Deploy AdminManagement first
    await deployer.deploy(artifacts.require("AdminManagement"));
    const adminManagementInstance = await artifacts.require("AdminManagement").deployed();
    const adminManagementAddress = adminManagementInstance.address;

    // Check that the address was correctly set
    if (!adminManagementAddress) {
        throw new Error("Failed to retrieve AdminManagement contract address");
    }

    // Deploy StockManagement with the address of AdminManagement
    await deployer.deploy(artifacts.require("StockManagement"), adminManagementAddress);
    const stockManagementInstance = await artifacts.require("StockManagement").deployed();
    const stockManagementAddress = stockManagementInstance.address;

    // Log the deployed addresses for verification
    console.log("AdminManagement deployed at:", adminManagementAddress);
    console.log("StockManagement deployed at:", stockManagementAddress);
};
