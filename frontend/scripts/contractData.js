export const AdminManagementAbi = (await(await fetch("/blockchain/build/contracts/AdminManagement.json")).json()).abi;
export const AdminManagementAddress = "0x38dDd675F2D9f6B9dd14acD02Fa77d7cA4DfDc61";

export const StockManagementAbi = (await(await fetch("/blockchain/build/contracts/StockManagement.json")).json()).abi;
export const StockManagementAddress = "0x9BFdA166233DCe912f6964146Fb8D95DD330dBC8";

export const purchaseProductAbi = (await(await fetch("/blockchain/build/contracts/PurchaseProduct.json")).json()).abi;
export const purchaseProductAddress = "0x5d6ae31108f37D703eE1617E23A350A57f7987F3";

export const refundClientAbi = (await(await fetch("/blockchain/build/contracts/RefundClient.json")).json()).abi;
export const refundClientAddress = "0x52D64BF17dB1F02D4507B211e220c291674e0C46";

export const refundAdminAbi = (await(await fetch("/blockchain/build/contracts/RefundAdmin.json")).json()).abi;
export const refundAdminAddress = "0xe5D9E5b526DEFF91fe70F13dA69bF7395b64cF20";