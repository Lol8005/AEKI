// module.exports = async function (deployer) {
//     await deployer.deploy(artifacts.require("AdminManagement"));
//     const adminManagementInstance = await artifacts.require("AdminManagement").deployed();
//     const adminManagementAddress = adminManagementInstance.address;

//     await deployer.deploy(artifacts.require("StockManagement"), adminManagementAddress);
//     const stockManagementInstance = await artifacts.require("StockManagement").deployed();
//     const stockManagementAddress = stockManagementInstance.address;

//     await deployer.deploy(artifacts.require("purchaseProduct"), stockManagementAddress, adminManagementAddress);
//     const purchaseProductInstance = await artifacts.require("purchaseProduct").deployed();
//     const purchaseProductAddress = purchaseProductInstance.address;

//     console.log("AdminManagement deployed at:", adminManagementAddress);
//     console.log("StockManagement deployed at:", stockManagementAddress);
//     console.log("purchaseProduct deployed at:", purchaseProductAddress);
// };

module.exports = async function (deployer) {
    await deployer.deploy(artifacts.require("purchaseProduct"), "0x92d6F72A3914F8F54bFD17027E9c3d34857E53bE", "0x0F226C307b1d3C39D71711953e7F795A0E347075");
    const purchaseProductInstance = await artifacts.require("purchaseProduct").deployed();
    const purchaseProductAddress = purchaseProductInstance.address;
};
