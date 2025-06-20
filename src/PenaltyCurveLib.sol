// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title PenaltyCurveLib
 * @dev A library to replicate Sonic's linear penalty curve for early redemptions.
 * The actual formula will be implemented here based on Sonic's official documentation.
 * This ensures all penalty calculations are handled in a centralized, testable, and gas-efficient way.
 */
library PenaltyCurveLib {
    function getClaimableAmount(
        uint256 principalAmount,
        uint256 vestingStart,
        uint256 vestingDuration,
        uint256 timeElapsed
    ) internal pure returns (uint256) {
        // Placeholder logic: This will be replaced with Sonic's actual penalty curve formula.
        // For now, it mirrors the linear vest calculation.
        if (timeElapsed >= vestingDuration) {
            return principalAmount;
        }
        return (principalAmount * timeElapsed) / vestingDuration;
    }
} 