// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AdminManagement.sol";
import "./StockManagement.sol";
import "./PurchaseProduct.sol";
import "./RefundClient.sol";

contract RefundAdmin {
    address immutable superAdmin;
    AdminManagement adminManagement;
    StockManagement stockManagement;
    PurchaseProduct purchaseProduct;
    RefundClient refundClient;
    

    uint128 private constant ethToMYR = 10881;
    uint128 private constant ethToWei = 1e18;

    address[] public banList;
    mapping(address => banShared.banInfo) public banList_map; //time when get ban

    uint public banDuration = 7 days;

    constructor(address _adminManagement, address _stockManagementAddress, address _purchaseProduct, address _refundClient) {
        superAdmin = msg.sender;
        adminManagement = AdminManagement(_adminManagement);
        stockManagement = StockManagement(_stockManagementAddress);
        purchaseProduct = PurchaseProduct(_purchaseProduct);
        refundClient = RefundClient(_refundClient);
    }

    modifier onlyActiveAdmin() {
        require(
            adminManagement.isAdmin(msg.sender) || msg.sender == superAdmin,
            "Only active admins can perform this action"
        );
        _;
    }

    //  debug only
    function setBanDuration(uint duration) public {
        banDuration = duration;
    }

    function approveRejectRefund(bytes32 _purchaseHash, shared.PurchaseStatus _purchaseStatus) public onlyActiveAdmin {
        require(_purchaseStatus == shared.PurchaseStatus.Refunded || _purchaseStatus == shared.PurchaseStatus.RequestDecline, "Invalid purchase status");

        shared.purchaseDetail[] memory _purchaseDetail = refundClient.getRequestRefundProduct();
        shared.purchaseDetail memory _temp;

        for (uint i = 0; i < _purchaseDetail.length; i++) {
            if (_purchaseDetail[i].purchaseHash == _purchaseHash) {
                _temp = _purchaseDetail[i];

                break;
            }
        }

        require(_temp.user != address(0), "Refund request not found");

        shared.purchaseDetail[] memory purchasedList = purchaseProduct.getUserPurchaseList(_temp.user);

        for (uint i = 0; i < purchasedList.length; i++) {
            if(purchasedList[i].purchaseHash == _purchaseHash){
                uint amounRefund = (stockManagement.returnProductPrice(_temp.productHash) * ethToWei * _temp.quantity) / ethToMYR;

                purchaseProduct.adminSetPurchaseRecordStatus(_temp.user, i, _purchaseHash, _purchaseStatus, amounRefund);

                refundClient.remove_requestRefundProduct(purchasedList[i].purchaseHash);

                break;
            }
        }
    }

    function banAccount(address user, bytes32 _purchaseHash, string memory _reason) external onlyActiveAdmin {
        if(!isAccountBanned(user)){
            banList.push(user);
        }

        banShared.banInfo storage _banInfo = banList_map[user];

        _banInfo.timeGotBan = block.timestamp;
        _banInfo.reason = _reason;
        _banInfo.purchaseHash = _purchaseHash;

        approveRejectRefund(_purchaseHash, shared.PurchaseStatus.RequestDecline);
    }

    //timelock every day
    function unbanAccount() external {
        address[] memory _temp = new address[](banList.length);
        uint64 index = 0;

        for (uint i = 0; i < banList.length; i++) {
            if( banList_map[banList[i]].timeGotBan + banDuration <= block.timestamp){
                _temp[index] = banList[i];
                index++;
            }
        }

        for (uint i = 0; i < index; i++) {
            remove_banList(_temp[i]);
        }
    }

    function isAccountBanned(address user) public view returns(bool) {
        for (uint i = 0; i < banList.length; i++) {
            if(banList[i] == user){
                return true;
            }
        }

        return false;
    }

    function getBanInfo(address user) public view returns(banShared.banInfo memory){
        return banList_map[user];
    }

    function remove_banList(address user) public onlyActiveAdmin {
        uint index = 0;

        for (uint i = 0; i < banList.length; i++) {
            if (banList[i] == user) {
                index = i;
                break;
            }
        }

        banList[index] = banList[banList.length - 1];
        banList.pop();
    }
}
