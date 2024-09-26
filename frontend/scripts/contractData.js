export const AdminManagementAbi = (await(await fetch("/blockchain/build/contracts/AdminManagement.json")).json()).abi;
export const AdminManagementAddress = "0xA2Bbf29dE34a94704130210f120Ebc4b8561F8d9";

export const StockManagementAbi = (await(await fetch("/blockchain/build/contracts/StockManagement.json")).json()).abi;
export const StockManagementAddress = "0xF3623d10122219FF1f81B913DE9A6454E205B4f3";

export const purchaseProductAbi = (await(await fetch("/blockchain/build/contracts/PurchaseProduct.json")).json()).abi;
export const purchaseProductAddress = "0x84D38B63A5Fa4bf3eBE478a4bAF346D8417aa081";

export const refundClientAbi = (await(await fetch("/blockchain/build/contracts/RefundClient.json")).json()).abi;
export const refundClientAddress = "0x9c219F7FbD14aCc341F6061266cE076300996490";

export const refundAdminAbi = (await(await fetch("/blockchain/build/contracts/RefundAdmin.json")).json()).abi;
export const refundAdminAddress = "0x8ABA6d4215b73a9e3eaCA2DA536B2f90222Dab4F";