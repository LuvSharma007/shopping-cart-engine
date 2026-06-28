import { globalPricingRules } from "../config/pricing.config.js";
import { getTierAndDiscountRate } from "../config/tier.config.js";

export function calculateCheckout(subtotal: number, distinctCategories: number) {
    const { tier, discountRate: tierRate, perks } = getTierAndDiscountRate(subtotal);

    const diversityApplied = distinctCategories >= globalPricingRules.diversityBonus.minDistinctCategories;
    let finalRate = tierRate;
    if (diversityApplied) finalRate += globalPricingRules.diversityBonus.bonusRate;
    finalRate = Math.min(finalRate, globalPricingRules.maxDiscountRate);

    const discountAmount = +(subtotal * finalRate).toFixed(2);
    const total = +(subtotal - discountAmount).toFixed(2);

    return { tier, perks, diversityApplied, discountRate: finalRate, discountAmount, total };
}