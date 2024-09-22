export const AdminManagementAbi = (await(await fetch("/blockchain/build/contracts/AdminManagement.json")).json()).abi;
export const AdminManagementAddress = "0x87Fbb1C515956Ac9E2B96A952673537C944A28B5";

export const StockManagementAbi = (await(await fetch("/blockchain/build/contracts/StockManagement.json")).json()).abi;
export const StockManagementAddress = "0x96d1b1137BB273eb5C820784aE8F70b4e38331A8";

export const purchaseProductAbi = (await(await fetch("/blockchain/build/contracts/PurchaseProduct.json")).json()).abi;
export const purchaseProductAddress = "0xeBb05271c1806fC7A23DD6a09d59e4A8101bB0F5";

export const refundClientAbi = (await(await fetch("/blockchain/build/contracts/RefundClient.json")).json()).abi;
export const refundClientAddress = "0x30a72267113f3b4a4ba82eC01712043299A227dA";

export const refundAdminAbi = (await(await fetch("/blockchain/build/contracts/RefundAdmin.json")).json()).abi;
export const refundAdminAddress = "0x2257eDaD4B6C4942C3e16cEd0B767614B74B8106";