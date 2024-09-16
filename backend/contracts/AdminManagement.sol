// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AdminManagement {
    address public immutable superAdmin; // Set once at deployment, never modified

    enum AdminStatus { NotRegister, Active, Fired, Resigned }

    struct Admin {
        AdminStatus status;
        uint32 disableTime; // Time where the admin access should be disabled
    }

    mapping(address => Admin) public admins;
    address[] private adminList;

    event AdminRegistered(address indexed admin);
    event AdminDisabled(address indexed admin, AdminStatus status, uint32 disableTime);
    event ActionLogged(address indexed admin, string actionType, string status, uint32 timestamp);

    modifier onlySuperAdmin() {
        require(msg.sender == superAdmin, "Only super admin can perform this action");
        _;
    }

    modifier onlyActiveAdmin() {
        require(admins[msg.sender].status == AdminStatus.Active, "Only active admins can perform this action");
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

        admins[_admin] = Admin(AdminStatus.Active, 0);
        adminList.push(_admin);

        emit AdminRegistered(_admin);
        emit ActionLogged(_admin, "Register", "successful", uint32(block.timestamp));
    }

    // Disable admin access instantly or at a set a future time
    function disableAdminAccess(address _admin, uint32 _disableTime) external onlySuperAdmin {
        Admin storage admin = admins[_admin];
        require(admin.status == AdminStatus.Active, "Admin not active");

        // Determine action based on disable time and minimize writes
        bool isFutureDisable = _disableTime > uint32(block.timestamp);
        admin.status = isFutureDisable ? AdminStatus.Resigned : AdminStatus.Fired;
        admin.disableTime = isFutureDisable ? _disableTime : uint32(block.timestamp);

        emit AdminDisabled(_admin, admin.status, admin.disableTime);
        emit ActionLogged(_admin, "Disable", isFutureDisable ? "processing" : "successful", uint32(block.timestamp));
    }

    // Finalize the disable process when the scheduled time has passed
    function finalizeDisable(address _admin) external {
        Admin storage admin = admins[_admin];
        require(admin.status == AdminStatus.Resigned, "Admin is not set for resignation");
        require(block.timestamp >= admin.disableTime, "Disable time has not been reached");

        // Update status to Fired aft final disablement
        admin.status = AdminStatus.Fired;

        emit ActionLogged(_admin, "Disable Finalize", "successful", uint32(block.timestamp));
    }

    // Provide view-only access to the admin list
    function viewAdminList() external view returns (address[] memory) {
        return adminList;
    }

    function isAdmin() public view returns(bool){
        return admins[msg.sender].status == AdminStatus.Active;
    }

    function isSuperAdmin(address _address) public view returns(bool){
        return superAdmin == _address;
    }
}