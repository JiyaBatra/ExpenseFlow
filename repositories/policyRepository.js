const PolicyNode = require('../models/PolicyNode');
const BaseRepository = require('./baseRepository');

/**
 * Policy Repository
 * Issue #757: Specialized data access for hierarchical policy nodes.
 */
class PolicyRepository extends BaseRepository {
    constructor() {
        super(PolicyNode);
    }

    async findByTarget(level, targetId) {
        return await this.findOne({ level, targetId, isActive: true });
    }

    async getAncestors(nodeId) {
        const ancestors = [];
        let currentNode = await this.findById(nodeId);

        while (currentNode && currentNode.parentId) {
            currentNode = await this.findById(currentNode.parentId);
            if (currentNode) ancestors.push(currentNode);
        }

        return ancestors;
    }

    async updateRules(nodeId, newRules) {
        return await this.updateById(nodeId, {
            $set: { rules: newRules }
        });
    }
}

module.exports = new PolicyRepository();
