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

import "./trackUserActivity.sol";

contract purchaseProduct is trackUserActivity{
    uint128 private constant ethToMYR = 10881;
    uint128 private constant ethToWei = 1e18;

    mapping(address => purchaseDetail[]) purchaseRecord;

    struct purchaseDetail{
        ProductCategory category;
        string productID;
        uint256 purchaseDate;
    }

    //ignore security, attacker modify js code on client side
    function userPurchaseProduct(uint16 productPrice, string memory productID, ProductCategory category) payable public {
        require(msg.value >= productPrice * ethToWei / ethToMYR, "Don't enough eth to proccess transaction");

        purchaseRecord[msg.sender].push(purchaseDetail(category, productID, block.timestamp));

        recordBuy(category);
    }
}