/*
1. admin upload ads details
2. Can adjust time
3. timelock detect time
4. detect AEKI user event



delivers promotional messages
track customer transactions and events. (backend side)

2^72/(10^18 *50)
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./StockManagement.sol";

contract purchaseProduct{
    address public immutable superAdmin;
    StockManagement stockManagement;

    uint128 private constant ethToMYR = 10881;
    uint128 private constant ethToWei = 1e18;

    mapping(address => purchaseDetail[]) purchaseRecord;

    struct purchaseDetail{
        bytes32 productHash;
        uint256 purchaseTime;
    }

    constructor(address _adminManagementAddress) {
        superAdmin = msg.sender;
        stockManagement = StockManagement(_adminManagementAddress);
    }

    //ignore security, attacker modify js code on client side
    function userPurchaseProduct(uint16 productPrice, bytes32 productHash) payable public {
        require(msg.value >= productPrice * ethToWei / ethToMYR, "Don't enough eth to proccess transaction");
        require(stockManagement.isProductOnSale(productHash), "Product not on sale");

        purchaseRecord[msg.sender].push(purchaseDetail(productHash, block.timestamp));
        stockManagement.decreaseStock(productHash);

        //recordBuy(category);
    }
}