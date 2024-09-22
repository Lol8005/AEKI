// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./StockManagement.sol";

library shared {
    enum PurchaseStatus {
        NotPurchase,        // 0
        Purchased,          // 1
        Refund_proccessing, // 2
        Refunded,           // 3
        RequestDecline,     // 4
        NotRefundable       // 5
    }

    struct purchaseDetail {
        bytes32 purchaseHash;
        bytes32 productHash;
        uint32 quantity;
        uint256 purchaseTime;
        shared.PurchaseStatus purchaseStatus;
        address user;
    }
}

contract PurchaseProduct {
    address public immutable superAdmin;
    StockManagement stockManagement;
    AdminManagement adminManagement;
    address refundClient_addres;
    address refundAdmin_addres;

    uint128 private constant ethToMYR = 10881;
    uint128 private constant ethToWei = 1e18;

    address[] public buyer;
    mapping(address => shared.purchaseDetail[]) public purchaseRecord;

    uint256[] public reminderTime;
    mapping(uint256 => address[]) public reminderList;

    event purchaseEvent(
        address user,
        bytes32 purchaseHash,
        bytes32 productHash,
        uint32 quantity
    );

    event callReminderEvent(address[] user, uint256 reminderTime);

    constructor(address _stockManagementAddress, address _adminManagement) {
        superAdmin = msg.sender;
        stockManagement = StockManagement(_stockManagementAddress);
        adminManagement = AdminManagement(_adminManagement);
    }

    function setRefundAddress(address _refundclient, address _refundAdmin) public onlyActiveAdmin{
        require(address(refundClient_addres) == address(0), "Already set");
        require(address(refundAdmin_addres) == address(0), "Already set");
        refundClient_addres = _refundclient;
        refundAdmin_addres = _refundAdmin;
    }

    function widthdraw() external {
        require(superAdmin == msg.sender, "Not super admin");
        (bool success, ) = superAdmin.call{ value: address(this).balance } ("");
        require(success, "Transfer failed.");
    }

    //ignore security, attacker modify js code on client side
    function userPurchaseProduct(
        bytes32 productHash,
        uint32 quantity
    ) public payable {
        uint32 price = stockManagement.returnProductPrice(productHash);

        require(
            msg.value >= (price * ethToWei) / ethToMYR * quantity,
            "Don't enough eth to proccess transaction"
        );

        stockManagement.decreaseStock(productHash, quantity);

        bytes32 _purchaseHash = keccak256(
            bytes(
                string(
                    abi.encodePacked(
                        productHash,
                        abi.encodePacked(quantity, block.timestamp)
                    )
                )
            )
        );

        if(!didUserPurchaseThingsBefore(msg.sender)){
            buyer.push(msg.sender);
        }

        purchaseRecord[msg.sender].push(
            shared.purchaseDetail(
                _purchaseHash,
                productHash,
                quantity,
                block.timestamp,
                shared.PurchaseStatus.Purchased,
                msg.sender
            )
        );

        emit purchaseEvent(msg.sender, _purchaseHash, productHash, quantity);
    }

    function didUserPurchaseThingsBefore(address user) public view returns(bool){
        return purchaseRecord[user].length != 0;
    }

    function isUserMakePurchase(
        address user,
        bytes32 purchaseHash
    ) external view returns (bool) {
        shared.purchaseDetail[] memory records = purchaseRecord[user];

        for (uint i = 0; i < records.length; i++) {
            if (records[i].purchaseHash == purchaseHash) {
                return true;
            }
        }

        return false;
    }

    function getUserPurchaseList(
        address user
    ) public view returns (shared.purchaseDetail[] memory) {
        return purchaseRecord[user];
    }

    function setReminder(address user, bytes32 productHash) public {
        uint256 _time = stockManagement.returnProductLaunchTime(productHash);

        require(!isUserAlreadySetReminder(user, _time), "Reminder already set");

        if (reminderList[_time].length == 0) {
            reminderTime.push(_time);
        }

        reminderList[_time].push(user);
    }

    function isUserAlreadySetReminder(address user, uint256 time) private view returns (bool){
        address[] memory users = reminderList[time];

        for (uint i = 0; i < users.length; i++) {
            if(users[i] == user){
                return true;
            }
        }

        return false;
    }

    function remove_reminderTime(uint256 _time) private {
        uint index = 0;

        for (uint i = 0; i < reminderTime.length; i++) {
            if (reminderTime[i] == _time) {
                index = i;
                break;
            }
        }

        reminderTime[index] = reminderTime[reminderTime.length - 1];
        reminderTime.pop();
    }

    function callReminderNow() public {
        uint256[] memory _temp = new uint256[](reminderTime.length);
        uint64 index = 0;

        for (uint i = 0; i < reminderTime.length; i++) {
            uint256 _time = reminderTime[i];
            if (block.timestamp >= _time) {
                emit callReminderEvent(reminderList[_time], block.timestamp);

                _temp[index] = _time;
                index++;
            }
        }

        

        for (uint i = 0; i < index; i++) {
            remove_reminderTime(_temp[i]);
        }
    }

    //timelock every day
    function updatePurchasedStatus() external {
        for (uint i = 0; i < buyer.length; i++) {
            shared.purchaseDetail[] storage _purchaseRecords = purchaseRecord[buyer[i]];

            for (uint j = 0; j < _purchaseRecords.length; j++) {
                if(_purchaseRecords[j].purchaseTime + 30 days <= block.timestamp && _purchaseRecords[j].purchaseStatus == shared.PurchaseStatus.Purchased){
                    _purchaseRecords[j].purchaseStatus = shared.PurchaseStatus.NotRefundable;
                }
            }
        }
    }

    function userSetPurchaseRecordStatus(address user, uint index, bytes32 _purchaseHash, shared.PurchaseStatus status) external {
        require(
            msg.sender == refundClient_addres || adminManagement.isAdmin(msg.sender) || msg.sender == superAdmin,
            "Only contract can perform this action"
        );

        require(purchaseRecord[user][index].purchaseHash ==_purchaseHash, "Invalid purchase hash");
        require(status == shared.PurchaseStatus.Refund_proccessing || status == shared.PurchaseStatus.NotRefundable, "Invalid status");

        if(status == shared.PurchaseStatus.Refund_proccessing){
            require(purchaseRecord[user][index].purchaseStatus == shared.PurchaseStatus.Purchased, "Invalid status");
        }else{
            require(purchaseRecord[user][index].purchaseStatus == shared.PurchaseStatus.Refund_proccessing, "Invalid status");
        }

        purchaseRecord[user][index].purchaseStatus = status;
    }

    modifier onlyActiveAdmin() {
        require(
            adminManagement.isAdmin(msg.sender) || msg.sender == superAdmin,
            "Only active admins can perform this action"
        );
        _;
    }

    function adminSetPurchaseRecordStatus(address user, uint index, bytes32 _purchaseHash, shared.PurchaseStatus status, uint amountRefund) external {
        require(
            msg.sender == refundAdmin_addres || adminManagement.isAdmin(msg.sender) || msg.sender == superAdmin,
            "Only contract can perform this action"
        );

        require(purchaseRecord[user][index].purchaseHash ==_purchaseHash, "Invalid purchase hash");
        require(status == shared.PurchaseStatus.Refunded || status == shared.PurchaseStatus.RequestDecline, "Invalid status");

        require(purchaseRecord[user][index].purchaseStatus == shared.PurchaseStatus.Refund_proccessing, "Invalid status");

        purchaseRecord[user][index].purchaseStatus = status;

        if(status == shared.PurchaseStatus.Refunded){
            (bool success, ) = (payable(user)).call{value: amountRefund}("");
            require(success, "transaction failed");
        }
    }
}
