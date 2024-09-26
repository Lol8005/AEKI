export const AdminManagementAbi = (await(await fetch("/blockchain/build/contracts/AdminManagement.json")).json()).abi;
export const AdminManagementAddress = "0x6cF8a39708856Ddc6D57C3e6C01aff1d6D972c41";

export const StockManagementAbi = (await(await fetch("/blockchain/build/contracts/StockManagement.json")).json()).abi;
export const StockManagementAddress = "0xd505f0DcE728921663a6D523765B4fACD001Ab55";

export const purchaseProductAbi = (await(await fetch("/blockchain/build/contracts/PurchaseProduct.json")).json()).abi;
export const purchaseProductAddress = "0x287BcAD53165dD28F2B08B8e3B9Ada4BECaBD070";

export const refundClientAbi = (await(await fetch("/blockchain/build/contracts/RefundClient.json")).json()).abi;
export const refundClientAddress = "0x57ee306De11d89705345567d5b6E0a9952aE8fb9";

export const refundAdminAbi = (await(await fetch("/blockchain/build/contracts/RefundAdmin.json")).json()).abi;
export const refundAdminAddress = "0x6292A954062B19e0E15CDc9e057e01E6e397F12d";