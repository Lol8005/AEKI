// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AdminManagement.sol";

contract StockManagement {
    address public immutable superAdmin;
    AdminManagement public adminManagement;

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
    ) external onlyActiveAdmin {
        require(price > 0, "Invalid price");
        require(quantity > 0, "Invalid quantity");

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
    ) external onlyActiveAdmin {
        bool isProductOnSale_bool = isProductOnSale(productHash);
        bool isProductGoingToLaunch_bool = isProductGoingToLaunch(productHash);

        require(
            isProductOnSale_bool || isProductGoingToLaunch_bool,
            "Product Not Available"
        );
        require(quantity > 0, "Invalid quantity");

        product_map[productHash].quantity += quantity;

        product_map[productHash].productStatus = ProductStatus.Active;
    }

    function discontinueItem(
        bytes32 productHash,
        uint256 discontinueTime
    ) external onlyActiveAdmin {
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
        // for (uint i = 0; i < onSale_productHash.length; i++) {
        //     if (onSale_productHash[i] == productHash) {
        //         return true;
        //     }
        // }

        return product_map[productHash].productStatus == ProductStatus.Active || product_map[productHash].productStatus == ProductStatus.OutOfStock;
    }

    function isProductGoingToLaunch(
        bytes32 productHash
    ) public view returns (bool) {
        // for (uint i = 0; i < goingToLaunch_productHash.length; i++) {
        //     if (goingToLaunch_productHash[i] == productHash) {
        //         return true;
        //     }
        // }

        return product_map[productHash].productStatus == ProductStatus.ReadyToLaunch;
    }

    function getProductList() external view returns(Product[] memory, Product[] memory, Product[] memory) {
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

    function updateProductStatus() external {
        require(msg.sender == superAdmin, "Only super admin are allow to perform this action");

        for (uint i = 0; i < goingToLaunch_productHash.length; i++) {
            bytes32 _hash = goingToLaunch_productHash[i];
            if(block.timestamp > product_map[_hash].launchTime && product_map[_hash].productStatus == ProductStatus.ReadyToLaunch){
                remove_goingToLaunch_productHash(_hash);
                onSale_productHash.push(_hash);
                product_map[_hash].productStatus = ProductStatus.Active;
            }
        }

        for (uint i = 0; i < onSale_productHash.length; i++) {
            bytes32 _hash = onSale_productHash[i];
            if(product_map[_hash].discontinueTime != 0 && block.timestamp > product_map[_hash].discontinueTime){
                remove_onSale_productHash(_hash);
                discontinueProduct_productHash.push(_hash);
                product_map[_hash].productStatus = ProductStatus.Discontinue;
            }
        }
    }

    function decreaseStock(bytes32 productHash, uint32 quantity) external {
        require(product_map[productHash].productStatus == ProductStatus.Active, "Product not active");
        require(product_map[productHash].quantity >= quantity, "Product stock not enough");

        product_map[productHash].quantity -= quantity;

        if(product_map[productHash].quantity == 0){
            product_map[productHash].productStatus = ProductStatus.OutOfStock;
        }
    }

    function returnProductPrice(bytes32 productHash) external view returns(uint32){
        require(isProductOnSale(productHash), "Not on sale");

        return product_map[productHash].price;
    }

    function returnProductLaunchTime(bytes32 productHash) external view returns(uint256){
        return product_map[productHash].launchTime;
    }
}
