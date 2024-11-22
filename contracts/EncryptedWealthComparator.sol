// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

/**
 * @title EncryptedWealthComparator
 * @author em_mutable
 * @notice A contract that determines the richest person among three participants using FHE.
 *         Participants must encrypt their wealth values client-side for submission to the
 *         contract. The contract only decrypts the final comparison result, so only the winner
 *         is ruser3aled while individual wealth amounts remain encrypted.
 *
 * @dev Uses TFHE library for fully homomorphic encryption operations to maintain privacy.
 */
contract EncryptedWealthComparator {
    // store the richest address
    address public richest;

    // mapping user addresses to submitted encrypted wealth amounts
    mapping(address => euint32) private encryptedWealth;

    // track if an address has submitted their wealth
    mapping(address => bool) public hasSubmitted;

    // event to announce the richest person
    event RichestFound(address indexed winner);

    /**
     * @notice Allows a user to submit their encrypted wealth amount.
     *
     * @param encryptedAmount    The FHE-encrypted wealth amount in bytes.
     */
    function submitWealth(bytes calldata encryptedAmount) external {
        require(!hasSubmitted[msg.sender], "Already submitted");

        // convert the encrypted bytes to euint32
        encryptedWealth[msg.sender] = TFHE.asEuint32(encryptedAmount);
        hasSubmitted[msg.sender] = true;
    }

    /**
     * @notice Determines and reveals which participant is the richest.
     *
     * @dev Compares encrypted wealth values using FHE operations and only
     *      decrypts the final comparison results to determine the winner.
     *
     * @param user1             The address of the first participant.
     * @param user2             The address of the second participant.
     * @param user3             The address of the third participant.
     */
    function findRichest(address user1, address user2, address user3) external {
        require(hasSubmitted[user1] && hasSubmitted[user2] && hasSubmitted[user3],
                "Not all participants have submitted");

        // get the encrypted wealth amounts for each user
        euint32 user1Wealth = encryptedWealth[user1];
        euint32 user2Wealth = encryptedWealth[user2];
        euint32 user3Wealth = encryptedWealth[user3];

        // compare user wealth using FHE operations
        ebool isUser1RicherThanUser2 = _compareWealth(user1Wealth, user2Wealth);
        ebool isUser1RicherThanUser3 = _compareWealth(user1Wealth, user3Wealth);
        ebool isUser2RicherThanUser3 = _compareWealth(user2Wealth, user3Wealth);

        // determine the richest user using encrypted boolean operations
        ebool isUser1Richest = TFHE.and(isUser1RicherThanUser2, isUser1RicherThanUser3);
        ebool isUser2Richest = TFHE.and(TFHE.not(isUser1RicherThanUser2), isUser2RicherThanUser3);

        // if neither user1 nor user2 is richest, then user3 is
        richest = TFHE.decrypt(isUser1Richest) ? user1 :
                 (TFHE.decrypt(isUser2Richest) ? user2 : user3);

        emit RichestFound(richest);
    }

    /**
     * @notice Compares two encrypted wealth amounts to determine which is greater.
     *
     * @dev Uses TFHE.gt() for encrypted comparison.
     *
     * @param a                 The first encrypted wealth amount to compare.
     * @param b                 The second encrypted wealth amount to compare.
     *
     * @return                  An encrypted boolean indicating if a is greater than b.
     */
    function _compareWealth(euint32 a, euint32 b) internal pure returns (ebool) {
        return TFHE.gt(a, b);
    }
}