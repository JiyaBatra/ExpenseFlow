const mongoose = require('mongoose');

/**
 * PolicyNode Model
 * Issue #757: Implements a hierarchical governance structure where policies 
 * can be inherited from parents (Global -> Tenant -> Workspace).
 */
const policyNodeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    level: {
        type: String,
        enum: ['global', 'tenant', 'workspace'],
        required: true
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PolicyNode',
        default: null
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId, // Could be TenantID or WorkspaceID
        index: true
    },
    rules: [{
        category: String,
        maxAmount: Number,
        requiresApproval: { type: Boolean, default: true },
        riskWeight: { type: Number, default: 1.0 },
        isBlocking: { type: Boolean, default: false },
        action: {
            type: String,
            enum: ['allow', 'review', 'block'],
            default: 'review'
        }
    }],
    overrides: {
        allowExceptions: { type: Boolean, default: false },
        strictMode: { type: Boolean, default: false }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for fast recursive lookups
policyNodeSchema.index({ level: 1, targetId: 1 });

module.exports = mongoose.model('PolicyNode', policyNodeSchema);
