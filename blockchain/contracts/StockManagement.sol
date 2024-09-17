// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AdminManagement.sol";

contract StockManagement {
    address public immutable superAdmin;
    AdminManagement adminManagement;

    constructor(address _adminManagementAddress) {
        superAdmin = msg.sender;
        adminManagement = AdminManagement(_adminManagementAddress);
    }

    modifier onlyActiveAdmin() {
        require(
            adminManagement.isAdmin(msg.sender) || msg.sender == superAdmin,
            "Only active admins can perform this action"
        );
        _;
    }

    enum ProductStatus {
        NotRegister,
        ReadyToLaunch,
        Active,
        OutOfStock,
        Discontinue
    }

    enum ProductCategory {
        Furniture, //0
        Storage, //1
        Kitchen, //2
        Decoration, //3
        Others //4
    }

    struct Product {
        bytes32 productUniqueHash;
        string productName;
        string productIPFS_img_hash;
        uint32 price;
        uint32 quantity;
        string description;
        ProductStatus productStatus;
        ProductCategory productCategory;
        uint256 launchTime;
        uint256 discontinueTime;
    }

    bytes32[] public onSale_productHash;
    bytes32[] public goingToLaunch_productHash;
    bytes32[] public discontinueProduct_productHash;
    mapping(bytes32 => Product) public product_map;

    function addNewProduct(
        string memory name,
        string memory img_hash,
        uint32 price,
        uint32 quantity,
        string memory description,
        ProductCategory productCategory,
        uint256 launchEpochTime,
        uint256 discontinueTime
    ) public onlyActiveAdmin {
        require(price > 0, "Invalid price");
        require(quantity > 0, "Invalid quantity");

        string(
            abi.encodePacked(abi.encodePacked(name, img_hash), block.timestamp)
        );
        bytes32 productUniqueHash = keccak256(
            bytes(
                string(
                    abi.encodePacked(
                        abi.encodePacked(name, img_hash),
                        block.timestamp
                    )
                )
            )
        );

        Product memory product = Product(
            productUniqueHash,
            name,
            img_hash,
            price,
            quantity,
            description,
            launchEpochTime == 0
                ? ProductStatus.Active
                : ProductStatus.ReadyToLaunch,
            productCategory,
            launchEpochTime,
            discontinueTime
        );

        if (launchEpochTime == 0) {
            require(
                discontinueTime != 0 ? discontinueTime > block.timestamp : true,
                "Invalid discontinue time"
            );

            onSale_productHash.push(productUniqueHash);
            product_map[productUniqueHash] = product;
        } else {
            require(launchEpochTime > block.timestamp, "Invalid launch time");
            require(
                discontinueTime != 0 ? discontinueTime > launchEpochTime : true,
                "Invalid discontinue time"
            );

            goingToLaunch_productHash.push(productUniqueHash);
            product_map[productUniqueHash] = product;
        }
    }

    function restockProduct(
        bytes32 productHash,
        uint32 quantity
    ) public onlyActiveAdmin {
        bool isProductOnSale_bool = isProductOnSale(productHash);
        bool isProductGoingToLaunch_bool = isProductGoingToLaunch(productHash);

        require(
            isProductOnSale_bool || isProductGoingToLaunch_bool,
            "Product Not Available"
        );
        require(quantity > 0, "Invalid quantity");

        product_map[productHash].quantity += quantity;
    }

    function discontinueItem(
        bytes32 productHash,
        uint256 discontinueTime
    ) public onlyActiveAdmin {
        bool isProductOnSale_bool = isProductOnSale(productHash);
        bool isProductGoingToLaunch_bool = isProductGoingToLaunch(productHash);

        require(
            isProductOnSale_bool || isProductGoingToLaunch_bool,
            "Product Not Available"
        );
        require(
            discontinueTime != 0 ? discontinueTime > block.timestamp : true,
            "Invalid discontinue time"
        );

        if (discontinueTime == 0) {
            product_map[productHash].discontinueTime = block.timestamp;
            product_map[productHash].productStatus = ProductStatus.Discontinue;

            discontinueProduct_productHash.push(productHash);

            isProductOnSale_bool ? remove_onSale_productHash(productHash) : remove_goingToLaunch_productHash(productHash);
        }else{
            product_map[productHash].discontinueTime = discontinueTime;
        }
    }

    function remove_onSale_productHash(bytes32 productHash) private {
        uint index = 0;

        for (uint i = 0; i < onSale_productHash.length; i++) {
            if (onSale_productHash[i] == productHash) {
                index = i;
                break;
            }
        }

        onSale_productHash[index] = onSale_productHash[
            onSale_productHash.length - 1
        ];
        onSale_productHash.pop();
    }

    function remove_goingToLaunch_productHash(bytes32 productHash) private {
        uint index = 0;

        for (uint i = 0; i < goingToLaunch_productHash.length; i++) {
            if (goingToLaunch_productHash[i] == productHash) {
                index = i;
                break;
            }
        }

        goingToLaunch_productHash[index] = goingToLaunch_productHash[
            goingToLaunch_productHash.length - 1
        ];
        goingToLaunch_productHash.pop();
    }

    function isProductOnSale(bytes32 productHash) public view returns (bool) {
        for (uint i = 0; i < onSale_productHash.length; i++) {
            if (onSale_productHash[i] == productHash) {
                return true;
            }
        }

        return false;
    }

    function isProductGoingToLaunch(
        bytes32 productHash
    ) public view returns (bool) {
        for (uint i = 0; i < goingToLaunch_productHash.length; i++) {
            if (goingToLaunch_productHash[i] == productHash) {
                return true;
            }
        }

        return false;
    }

    function getProductList() public view returns(Product[] memory, Product[] memory, Product[] memory) {
        Product[] memory onSale = new Product[](onSale_productHash.length);
        Product[] memory goingToLaunch = new Product[](goingToLaunch_productHash.length);
        Product[] memory discontinueProduct = new Product[](discontinueProduct_productHash.length);

        for (uint i = 0; i < onSale_productHash.length; i++) {
            onSale[i] = product_map[onSale_productHash[i]];
        }

        for (uint i = 0; i < goingToLaunch_productHash.length; i++) {
            goingToLaunch[i] = product_map[goingToLaunch_productHash[i]];
        }

        for (uint i = 0; i < discontinueProduct_productHash.length; i++) {
            discontinueProduct[i] = product_map[discontinueProduct_productHash[i]];
        }

        return (onSale, goingToLaunch, discontinueProduct);
    }

    function decreaseStock(bytes32 productHash) external {
        product_map[productHash].quantity -= 1;
    }

    function currentTime() public view returns(uint256){
        return block.timestamp;
    }
}
