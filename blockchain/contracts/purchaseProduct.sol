// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./StockManagement.sol";

contract purchaseProduct{
    address public immutable superAdmin;
    StockManagement stockManagement;

    uint128 private constant ethToMYR = 10881;
    uint128 private constant ethToWei = 1e18;

    mapping(address => purchaseDetail[]) purchaseRecord;

    event purchaseEvent(address user, bytes32 purchaseHash, bytes32 productHash, uint32 quantity);

    enum PurchaseStatus{
        NotPurchase,
        Purchased,
        Refund_proccessing,
        Refunded,
        NotRefundable
    }

    struct purchaseDetail{
        bytes32 purchaseHash;
        bytes32 productHash;
        uint32 quantity;
        uint256 purchaseTime;
        PurchaseStatus purchaseStatus;
    }

    constructor(address _adminManagementAddress) {
        superAdmin = msg.sender;
        stockManagement = StockManagement(_adminManagementAddress);
    }

    //ignore security, attacker modify js code on client side
    function userPurchaseProduct(bytes32 productHash, uint32 quantity) payable public {
        uint32 price = stockManagement.returnProductPrice(productHash);

        require(msg.value >= price * ethToWei / ethToMYR, "Don't enough eth to proccess transaction");

        stockManagement.decreaseStock(productHash, quantity);

        bytes32 _purchaseHash = keccak256(
            bytes(
                string(
                    abi.encodePacked(
                        productHash,
                        abi.encodePacked(
                            quantity,
                            block.timestamp
                        )
                    )
                )
            )
        );
        
        purchaseRecord[msg.sender].push(purchaseDetail(_purchaseHash, productHash, quantity, block.timestamp,PurchaseStatus.Purchased));
        

        emit purchaseEvent(msg.sender, _purchaseHash, productHash, quantity);
    }

    function isUserMakePurchase(address user, bytes32 purchaseHash) external view returns (bool){
        purchaseDetail[] memory records = purchaseRecord[user];

        for (uint i = 0; i < records.length; i++) {
            if (records[i].purchaseHash == purchaseHash){
                return true;
            }
        }

        return false;
    }

    function getUserPurchaseList(address user) public view returns(purchaseDetail[] memory){
        return purchaseRecord[user];
    }
}