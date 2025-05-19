// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "@thirdweb-dev/contracts/base/ERC1155Drop.sol";

contract movbasebg is ERC1155Drop {
    error ExceedsMaxMint();
    error InvalidQuantity();

    uint256 private constant MAX_PER_WALLET = 5;

    mapping(address => uint256) public mintsPerWallet;

    constructor(
        address _defaultAdmin,
        string memory _name,
        string memory _symbol,
        address _royaltyRecipient,
        uint128 _royaltyBps,
        address _primarySaleRecipient
    )
        ERC1155Drop(
            _defaultAdmin,
            _name,
            _symbol,
            _royaltyRecipient,
            _royaltyBps,
            _primarySaleRecipient
        )
    {}

    function mintRandom(uint256 quantity) external payable {
        if (quantity == 0) revert InvalidQuantity();
        if (mintsPerWallet[msg.sender] + quantity > MAX_PER_WALLET) revert ExceedsMaxMint();

        mintsPerWallet[msg.sender] += quantity;

        unchecked {
            for (uint256 i; i < quantity; i++) {
                uint256 rand = uint256(keccak256(abi.encodePacked(
                    msg.sender,
                    block.timestamp,
                    block.difficulty,
                    i
                ))) % 100;

                _mint(
                    msg.sender,
                    rand < 50 ? 0 : (rand < 85 ? 1 : 2),
                    1,
                    ""
                );
            }
        }
    }
}