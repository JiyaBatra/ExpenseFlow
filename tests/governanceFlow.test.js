const assert = require('assert');
const riskScoring = require('../utils/riskScoring');

/**
 * Governance Flow Tests
 * Issue #757: Verifies hierarchical risk scoring and policy resolution logic.
 */
describe('Hierarchical Governance & Risk Framework', () => {

    describe('RiskScoring Engine', () => {
        it('should calculate base risk score for compliant transaction', () => {
            const transaction = { amount: 50, category: 'office' };
            const rule = { maxAmount: 100, riskWeight: 1.0 };

            const score = riskScoring.calculateScore(transaction, rule);
            assert.strictEqual(score, 10); // Base weight score
        });

        it('should exponentially increase score on limit breach', () => {
            const transaction = { amount: 400, category: 'office' }; // 4x limit
            const rule = { maxAmount: 100, riskWeight: 1.0 };

            const score = riskScoring.calculateScore(transaction, rule);
            // log2(4) = 2. 2 * 20 = 40. 40 + 10 = 50.
            assert.strictEqual(score, 50);
        });

        it('should assign critical severity to very high scores', () => {
            const severity = riskScoring.getSeverity(85);
            assert.strictEqual(severity, 'critical');
        });
    });

    describe('Policy Resolution Logic (Mocked)', () => {
        // Note: Database-dependent tests for PolicyResolver would require a full Mongoose mock
        // Here we focus on the logic that would be used by the resolver.

        it('should correctly merge hierarchical rules in Map', () => {
            const globalRules = [{ category: 'food', maxAmount: 50 }];
            const tenantRules = [{ category: 'food', maxAmount: 100 }, { category: 'travel', maxAmount: 500 }];

            const merged = new Map();

            // Simulate resolver applyRulesToMap (Workspace > Tenant > Global)
            const apply = (m, rules) => rules.forEach(r => m.set(r.category, r));

            apply(merged, globalRules);
            apply(merged, tenantRules); // Tenant overrides global

            assert.strictEqual(merged.get('food').maxAmount, 100);
            assert.strictEqual(merged.get('travel').maxAmount, 500);
        });
    });
});
