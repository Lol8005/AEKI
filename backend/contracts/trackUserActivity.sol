// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract trackUserActivity{

    event Visit(address userAddress, ActivityVisit[] visitedProductCategoryList, uint256 epochTime);
    event Buy(address userAddress, ProductCategory broughtProduct, uint256 epochTime);

    enum ProductCategory{
        Furniture,  //0
        Storage,    //1
        Kitchen,    //2
        Decoration, //3
        Others      //4
    }

    struct ActivityVisit{
        ProductCategory productCategory;
        uint16 visitDuration; // in seconds
    }

    //example: pass [[0,60],[2,454]]
    function recordVisit(ActivityVisit[] memory _visitedList) public {
        emit Visit(msg.sender, _visitedList, block.timestamp);
    }

    function recordBuy(ProductCategory _broughtProuct) external {
        emit Buy(msg.sender, _broughtProuct, block.timestamp);
    }

    receive() external payable {
        require(msg.value == 0, "Contract don't accept fees");
    }
}