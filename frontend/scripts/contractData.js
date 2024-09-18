export const AdminManagementAbi = (await(await fetch("/blockchain/build/contracts/AdminManagement.json")).json()).abi;
export const AdminManagementAddress = "0xB75eb39e8b14A29a9985aC76407872d4f19b2B58";

export const StockManagementAbi = (await(await fetch("/blockchain/build/contracts/StockManagement.json")).json()).abi;
export const StockManagementAddress = "0xaef6469fF2478fEC9005Ce192C4E0E70130858E0";