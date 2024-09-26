export const AdminManagementAbi = (await(await fetch("/blockchain/build/contracts/AdminManagement.json")).json()).abi;
export const AdminManagementAddress = "0xB02f26fDf2a051F043d2fCb7D9f1eABC779b8Ef4";

export const StockManagementAbi = (await(await fetch("/blockchain/build/contracts/StockManagement.json")).json()).abi;
export const StockManagementAddress = "0xcB607261F20A183Cc9C628A1d8D44944a942602F";

export const purchaseProductAbi = (await(await fetch("/blockchain/build/contracts/PurchaseProduct.json")).json()).abi;
export const purchaseProductAddress = "0x24E228FDb8f0db30b3D2e95460B1ce23AdA094a1";

export const refundClientAbi = (await(await fetch("/blockchain/build/contracts/RefundClient.json")).json()).abi;
export const refundClientAddress = "0x2A06Dd2Fd4e1311e81B319cFA99F2335905e4d98";

export const refundAdminAbi = (await(await fetch("/blockchain/build/contracts/RefundAdmin.json")).json()).abi;
export const refundAdminAddress = "0x6713A9BE79521Fb45023Ac5c07ACA053B8045d19";