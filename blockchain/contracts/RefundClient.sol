// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PurchaseProduct.sol";
import "./AdminManagement.sol";
import "./RefundAdmin.sol";

library banShared{
    struct banInfo{
        uint256 timeGotBan;
        string reason;
        bytes32 purchaseHash;
    }
}

contract RefundClient {
    address public immutable superAdmin;
    PurchaseProduct purchaseProduct;
    AdminManagement public adminManagement;
    RefundAdmin refundAdmin;

    constructor(address _adminManagement, address _purchaseProduct) {
        superAdmin = msg.sender;
        adminManagement = AdminManagement(_adminManagement);
        purchaseProduct = PurchaseProduct(_purchaseProduct);
    }

    modifier onlyActiveAdmin() {
        require(
            adminManagement.isAdmin(msg.sender) || msg.sender == superAdmin,
            "Only active admins can perform this action"
        );
        _;
    }

    function setRefundAdmin(address _refundAdmin) public onlyActiveAdmin{
        require(address(refundAdmin) == address(0), "Already set");
        refundAdmin = RefundAdmin(_refundAdmin);
    }
  
    // REFUND 
    shared.purchaseDetail[] public requestRefundProduct;

    function didPurchaseAllowToRefund(address user, bytes32 _purchaseHash) public view returns(bool) {
        shared.purchaseDetail[] memory purchaseDetails = purchaseProduct.getUserPurchaseList(user);

        for (uint i = 0; i < purchaseDetails.length; i++) {
            if(purchaseDetails[i].purchaseHash == _purchaseHash && purchaseDetails[i].purchaseStatus == shared.PurchaseStatus.Purchased){
                return true;
            }
        }

        return false;
    }

    function refundProduct(bytes32 _purchaseHash) public {
        require(!refundAdmin.isAccountBanned(msg.sender), "Your account has been banned, can't proceed");

        // Didnt modify data at puchaseproduct.sol
        shared.purchaseDetail[] memory purchaseDetails = purchaseProduct.getUserPurchaseList(msg.sender);

        for (uint i = 0; i < purchaseDetails.length; i++) {
            if(purchaseDetails[i].purchaseHash == _purchaseHash && purchaseDetails[i].purchaseStatus == shared.PurchaseStatus.Purchased){
                // purchaseDetails[i].purchaseStatus = shared.PurchaseStatus.Refund_proccessing;
                purchaseProduct.userSetPurchaseRecordStatus(msg.sender, i, _purchaseHash, shared.PurchaseStatus.Refund_proccessing);

                requestRefundProduct.push(purchaseDetails[i]);
                return;
            }
        }

        revert("Purchased product is not eligible to refund");
    }

    function cancelRefund(bytes32 _purchaseHash) public {
        shared.purchaseDetail[] memory purchaseDetails = purchaseProduct.getUserPurchaseList(msg.sender);

        for (uint i = 0; i < purchaseDetails.length; i++) {
            if(purchaseDetails[i].purchaseHash == _purchaseHash && purchaseDetails[i].purchaseStatus == shared.PurchaseStatus.Refund_proccessing){
                //purchaseDetails[i].purchaseStatus = shared.PurchaseStatus.NotRefundable;
                purchaseProduct.userSetPurchaseRecordStatus(msg.sender, i, _purchaseHash, shared.PurchaseStatus.NotRefundable);

                remove_requestRefundProduct(_purchaseHash);
                return;
            }
        }

        revert("Purchased product is not eligible to refund");
    }

    function remove_requestRefundProduct(bytes32 _purchaseHash) public {
        uint index = 0;

        for (uint i = 0; i < requestRefundProduct.length; i++) {
            if (requestRefundProduct[i].purchaseHash == _purchaseHash) {
                index = i;
                break;
            }
        }

        require(address(refundAdmin) == msg.sender || requestRefundProduct[index].user == msg.sender || adminManagement.isAdmin(msg.sender), "Invalid user");

        requestRefundProduct[index] = requestRefundProduct[
            requestRefundProduct.length - 1
        ];

        requestRefundProduct.pop();
    }

    function getRequestRefundProduct() external view returns(shared.purchaseDetail[] memory){
        return requestRefundProduct;
    }
}
