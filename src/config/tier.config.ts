interface TierResult {
    tier: "NORMAL" | "SILVER" | "GOLD" | "PLATINUM";
    discountRate: number;
    perks: string[];
}

export const getTierAndDiscountRate = (subTotal: number): TierResult => {
    if (subTotal < 15000) {
        return {
            tier: "NORMAL",
            discountRate: 0.00,
            perks: []
        }
    }
    if (subTotal < 50000) {
        return {
            tier: "SILVER",
            discountRate: 0.05,
            perks: []
        }
    }
    if (subTotal < 100000) {
        return {
            tier: "GOLD",
            discountRate: 0.10,
            perks: ["FREE_SHIPPING"]
        }
    }
    return {
        tier: "PLATINUM",
        discountRate: 0.15,
        perks: ["FREE_SHIPPING", "DOUBLE_POINTS"]
    };
};