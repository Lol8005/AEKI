// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AdminManagement {
    address public immutable superAdmin; // Set once at deployment, never modified

    enum AdminStatus { NotRegister, Active, Fired, Resigned }

    struct Admin {
        AdminStatus status;
        uint128 disableTime; // Time where the admin access should be disabled
        address adminAddress;
    }

    enum DisableStatus{ Queued, Cancelled, Executed, Instantly }

    mapping(address => Admin) public admins;
    address[] public adminList;

    event AdminRegistered(address indexed admin);

    event AdminDisabled(address indexed admin, uint128 disableTime, DisableStatus disableStatus);

    modifier onlySuperAdmin() {
        require(msg.sender == superAdmin, "Only super admin can perform this action");
        _;
    }

    modifier onlyActiveAdmin() {
        require(admins[msg.sender].status == AdminStatus.Active || msg.sender == superAdmin, "Only active admins can perform this action");
        _;
    }

    constructor() {
        superAdmin = msg.sender;
    }

    // Register a new admin
    function registerNewAdmin(address _admin) external onlySuperAdmin {
        require(_admin != address(0), "Invalid address");
        require(_admin != superAdmin, "Super admin cannot be registered as an admin");
        require(admins[_admin].status == AdminStatus.NotRegister, "Admin already active or resigned");

        admins[_admin] = Admin(AdminStatus.Active, 0, _admin);
        adminList.push(_admin);

        emit AdminRegistered(_admin);
    }

    // Disable admin access instantly or at a set a future time
    function disableAdminAccess(address _admin, uint128 _disableTime) external onlySuperAdmin {
        Admin storage admin = admins[_admin];
        require(admin.status == AdminStatus.Active || admin.status == AdminStatus.Resigned, "Admin not active");
        require(_disableTime == 0 || _disableTime > block.timestamp, "Invalid resignation time");

        // Determine action based on disable time and minimize writes
        bool isFutureDisable = _disableTime > uint128(block.timestamp);
        admin.status = isFutureDisable ? AdminStatus.Resigned : AdminStatus.Fired;
        admin.disableTime = isFutureDisable ? _disableTime : uint128(block.timestamp);

        emit AdminDisabled(_admin, admin.disableTime, isFutureDisable? DisableStatus.Queued : DisableStatus.Instantly);
    }

    function cancelResignation(address _admin) external onlySuperAdmin {
        require(admins[_admin].status == AdminStatus.Resigned, "The admin is not in resigned status");

        admins[_admin].status = AdminStatus.Active;
        uint128 _temp = admins[_admin].disableTime;
        admins[_admin].disableTime = 0;

        emit AdminDisabled(_admin, _temp, DisableStatus.Cancelled);
    }

    // Finalize the disable process when the scheduled time has passed
    function finalizeDisable() public onlySuperAdmin {
        for (uint i = 0; i < adminList.length; i++) {
            if(admins[adminList[i]].status == AdminStatus.Resigned && admins[adminList[i]].disableTime < block.timestamp){
                admins[adminList[i]].status = AdminStatus.Fired;

                //emit ActionLogged(adminList[i], "Disable Finalize", "successful", uint128(block.timestamp));
                emit AdminDisabled(adminList[i], admins[adminList[i]].disableTime, DisableStatus.Executed);
            }
        }
    }

    // Provide view-only access to the admin list
    function viewAdminList() external view returns (address[] memory, address[] memory, address[] memory) {
        address[] memory _activeAdminList = new address[](adminList.length);
        uint _activeAdminListIndex = 0;

        address[] memory _resignAdminList= new address[](adminList.length);
        uint _resignAdminListIndex = 0;

        address[] memory _firedAdminList= new address[](adminList.length);
        uint _firedAdminListIndex = 0;

        for (uint i = 0; i < adminList.length; i++) {
            if(admins[adminList[i]].status == AdminStatus.Active){
                _activeAdminList[_activeAdminListIndex] = adminList[i];
                _activeAdminListIndex++;
            }else if(admins[adminList[i]].status == AdminStatus.Resigned){
                _resignAdminList[_resignAdminListIndex] = adminList[i];
                _resignAdminListIndex++;
            }else if(admins[adminList[i]].status == AdminStatus.Fired){
                _firedAdminList[_firedAdminListIndex] = adminList[i];
                _firedAdminListIndex++;
            }
        }

        return (_activeAdminList, _resignAdminList, _firedAdminList);
    }

    function isAdmin(address _address) public view returns(bool){
        return admins[_address].status == AdminStatus.Active || admins[_address].status == AdminStatus.Resigned;
    }

    function isSuperAdmin(address _address) public view returns(bool){
        return superAdmin == _address;
    }
}