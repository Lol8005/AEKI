// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

contract trackUserActivity{

    enum ActivityChoice {
        Visit,  //user interest
        Buy     //unlikely need the same thing
    }

    enum ProductCategory{
        Furniture,
        Storage,
        Kitchen,
        Decoration,
        Others
    }

    struct ActivityVisit{
        ProductCategory[] productCategory;
        uint256[] visitDuration; // in seconds
    }

    struct Activity{
        address userAddress;
        
        //Visit
    }

    receive() external payable {
        require(msg.value == 0, "Contract don't accept fees");
    }
}