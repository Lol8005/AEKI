export const AdminManagementAbi = (await(await fetch("/blockchain/build/contracts/AdminManagement.json")).json()).abi;
export const AdminManagementAddress = "0x594c6DEc59d8675818a2f535122ec9c88E26CaA9";

export const StockManagementAbi = (await(await fetch("/blockchain/build/contracts/StockManagement.json")).json()).abi;
export const StockManagementAddress = "0x165Bbb7ec19bB197DC5937faB4B63Aa02cc4633c";