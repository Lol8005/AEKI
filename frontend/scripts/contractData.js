export const AdminManagementAbi = (await(await fetch("/blockchain/build/contracts/AdminManagement.json")).json()).abi;
export const AdminManagementAddress = "0x0F226C307b1d3C39D71711953e7F795A0E347075";

export const StockManagementAbi = (await(await fetch("/blockchain/build/contracts/StockManagement.json")).json()).abi;
export const StockManagementAddress = "0x92d6F72A3914F8F54bFD17027E9c3d34857E53bE";

export const purchaseProductAbi = (await(await fetch("/blockchain/build/contracts/purchaseProduct.json")).json()).abi;
export const purchaseProductAddress = "0xbaDbd42D26AaFcCe58f570fD93829e4B33b134b8";