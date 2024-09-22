// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./StockManagement.sol";

contract purchaseProduct {
    address public immutable superAdmin;
    StockManagement stockManagement;
    AdminManagement adminManagement;

    uint128 private constant ethToMYR = 10881;
    uint128 private constant ethToWei = 1e18;

    address[] public buyer;
    mapping(address => purchaseDetail[]) public purchaseRecord;

    uint256[] public reminderTime;
    mapping(uint256 => address[]) public reminderList;

    event purchaseEvent(
        address user,
        bytes32 purchaseHash,
        bytes32 productHash,
        uint32 quantity
    );

    event callReminderEvent(address[] user, uint256 reminderTime);

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
        PurchaseStatus purchaseStatus;
        address user;
    }

    constructor(address _stockManagementAddress, address _adminManagement) {
        superAdmin = msg.sender;
        stockManagement = StockManagement(_stockManagementAddress);
        adminManagement = AdminManagement(_adminManagement);
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
            purchaseDetail(
                _purchaseHash,
                productHash,
                quantity,
                block.timestamp,
                PurchaseStatus.Purchased,
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
        purchaseDetail[] memory records = purchaseRecord[user];

        for (uint i = 0; i < records.length; i++) {
            if (records[i].purchaseHash == purchaseHash) {
                return true;
            }
        }

        return false;
    }

    function getUserPurchaseList(
        address user
    ) public view returns (purchaseDetail[] memory) {
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
            purchaseDetail[] storage _purchaseRecords = purchaseRecord[buyer[i]];

            for (uint j = 0; j < _purchaseRecords.length; j++) {
                if(_purchaseRecords[j].purchaseTime + 30 days <= block.timestamp && _purchaseRecords[j].purchaseStatus == PurchaseStatus.Purchased){
                    _purchaseRecords[j].purchaseStatus = PurchaseStatus.NotRefundable;
                }
            }
        }
    }

    /*
    function getPurchaseDetails(address user, bytes32 _purchaseHash) public view returns (purchaseDetail memory) {
        for (uint i = 0; i < purchaseRecord[user].length; i++) {
            if(purchaseRecord[user][i].purchaseHash == _purchaseHash){
                return purchaseRecord[user][i];
            }
        }

        revert("Didn't purchase the product");
    }

    function didUserBuyProduct(address user, bytes32 _purchaseHash) public view returns (bool){
        for (uint i = 0; i < purchaseRecord[user].length; i++) {
            if(purchaseRecord[user][i].purchaseHash == _purchaseHash){
                return true;
            }
        }

        return false;
    } */
  
    // REFUND 
    purchaseDetail[] public requestRefundProduct;
    address[] banList;
    mapping(address => banInfo) public banList_map; //time when get ban

    struct banInfo{
        uint256 timeGotBan;
        string reason;
        bytes32 purchaseHash;
    }

    modifier onlyActiveAdmin() {
        require(
            adminManagement.isAdmin(msg.sender) || msg.sender == superAdmin,
            "Only active admins can perform this action"
        );
        _;
    }

    function didPurchaseAllowToRefund(address user, bytes32 _purchaseHash) public view returns(bool) {
        for (uint i = 0; i < purchaseRecord[user].length; i++) {
            if(purchaseRecord[user][i].purchaseHash == _purchaseHash && purchaseRecord[user][i].purchaseStatus == PurchaseStatus.Purchased){
                return true;
            }
        }

        return false;
    }

    function refundProduct(bytes32 _purchaseHash) public {
        require(!isAccountBanned(msg.sender), "Your account has been banned, can't proceed");

        for (uint i = 0; i < purchaseRecord[msg.sender].length; i++) {
            if(purchaseRecord[msg.sender][i].purchaseHash == _purchaseHash && purchaseRecord[msg.sender][i].purchaseStatus == PurchaseStatus.Purchased){
                purchaseRecord[msg.sender][i].purchaseStatus = PurchaseStatus.Refund_proccessing;

                requestRefundProduct.push(purchaseRecord[msg.sender][i]);
                return;
            }
        }

        revert("Purchased product is not aligible to refund");
    }

    function cancelRefund(bytes32 _purchaseHash) public {
        for (uint i = 0; i < purchaseRecord[msg.sender].length; i++) {
            if(purchaseRecord[msg.sender][i].purchaseHash == _purchaseHash && purchaseRecord[msg.sender][i].purchaseStatus == PurchaseStatus.Refund_proccessing){
                purchaseRecord[msg.sender][i].purchaseStatus = PurchaseStatus.NotRefundable;

                remove_requestRefundProduct(_purchaseHash);
                return;
            }
        }

        revert("Purchased product is not aligible to refund");
    }

    function approveRejectRefund(bytes32 _purchaseHash, PurchaseStatus _purchaseStatus) public onlyActiveAdmin {
        require(_purchaseStatus == PurchaseStatus.Refunded || _purchaseStatus == PurchaseStatus.RequestDecline, "Invalid purchase status");

        purchaseDetail memory _purchaseDetail;

        for (uint i = 0; i < requestRefundProduct.length; i++) {
            if (requestRefundProduct[i].purchaseHash == _purchaseHash) {
                _purchaseDetail = requestRefundProduct[i];

                break;
            }
        }

        require(_purchaseDetail.user != address(0), "Refund request not found");

        for (uint i = 0; i < purchaseRecord[_purchaseDetail.user].length; i++) {
            if(purchaseRecord[_purchaseDetail.user][i].purchaseHash == _purchaseHash){
                purchaseRecord[_purchaseDetail.user][i].purchaseStatus = _purchaseStatus;

                if(_purchaseStatus == PurchaseStatus.Refunded){
                    uint amounRefund = (stockManagement.returnProductPrice(_purchaseDetail.productHash) * ethToWei * _purchaseDetail.quantity) / ethToMYR;

                    (bool success, ) = (payable(_purchaseDetail.user)).call{value: amounRefund}("");

                    require(success, "transaction failed");
                }

                remove_requestRefundProduct(purchaseRecord[_purchaseDetail.user][i].purchaseHash);

                break;
            }
        }
    }

    function remove_requestRefundProduct(bytes32 _purchaseHash) private {
        uint index = 0;

        for (uint i = 0; i < requestRefundProduct.length; i++) {
            if (requestRefundProduct[i].purchaseHash == _purchaseHash) {
                index = i;
                break;
            }
        }

        requestRefundProduct[index] = requestRefundProduct[
            requestRefundProduct.length - 1
        ];

        requestRefundProduct.pop();
    }

    function getRequestRefundProduct() external view returns(purchaseDetail[] memory){
        return requestRefundProduct;
    }

    function isAccountBanned(address user) public view returns(bool) {
        for (uint i = 0; i < banList.length; i++) {
            if(banList[i] == user){
                return true;
            }
        }

        return false;
    }

    function banAccount(address user, bytes32 _purchaseHash, string memory _reason) external onlyActiveAdmin {
        if(!isAccountBanned(user)){
            banList.push(user);
        }

        banList_map[user].timeGotBan = block.timestamp;
        banList_map[user].reason = _reason;
        banList_map[user].purchaseHash = _purchaseHash;

        approveRejectRefund(_purchaseHash, PurchaseStatus.RequestDecline);
    }

    //timelock every day
    function unbanAccount() external {
        address[] memory _temp = new address[](banList.length);
        uint64 index = 0;

        for (uint i = 0; i < banList.length; i++) {
            if(banList_map[banList[i]].timeGotBan + 7 days <= block.timestamp){
                _temp[index] = banList[i];
                index++;
            }
        }

        for (uint i = 0; i < index; i++) {
            remove_banList(_temp[i]);
        }
    }

    function remove_banList(address user) private {
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
