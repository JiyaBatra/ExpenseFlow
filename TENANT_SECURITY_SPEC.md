# Multi-Tenant Isolation & Security Specification

## 🚀 Overview
Issue #729 implements a multi-layered "Strict Isolation Layer" to ensure that data in a multi-tenant environment remains encapsulated within its respective workspace. This architecture prevents horizontal privilege escalation (ID guessing) and cross-workspace data leakage.

## 🏗️ The 4-Layer Isolation Stack

### 1. Ingress Resolution (`middleware/tenantResolver.js`)
The first line of defense.
- **Context Identification**: Captures `workspaceId` from various request sources (Headers, Path, Body).
- **Access Validation**: Cross-references the authenticated `req.user.workspaces` list against the requested `workspaceId`.
- **Policy Loading**: Injects `req.tenant.config` containing workspace-specific security constraints.

### 2. ORM Scoping (`utils/queryScoper.js`)
Ensures no "naked" queries reach the database.
- **Automatic Interception**: Every service-level query is forced through the scoper.
- **Hard-Coded Filters**: Injects `{ workspace: currentWorkspaceId }` into every Mongoose filter.
- **Violation Guard**: Throws a fatal exception if a developer tries to manually query a different workspace while under a tenant context.

### 3. Logic Boundaries (`services/workspaceService.js`)
Handles secure transitions between tenants.
- **Safe Relocation**: Logic for moving resources (like expenses) across workspaces requires explicit ownership checks on both Source and Target workspaces before updating the foreign key.
- **Hierarchical Check**: Permission resolution respects sub-workspace inheritance while maintaining strict tenant root boundaries.

### 4. Egress Cleansing (`middleware/leakageGuard.js`)
The "Fail-Safe" for response data.
- **Deep Scan**: Intercepts `res.json` and scans the payload for any object belonging to a foreign workspace.
- **Silent Sanitization**: If a list contains a leaked item, it is silently stripped.
- **Hard Block**: If a single object response mismatches the tenant, the entire request is aborted with a security violation.

## 🔐 Configuration & Monitoring (`models/TenantConfig.js`)
Administrators can fine-tune isolation levels for high-compliance workspaces:
- **Standard**: Soft isolation with basic query scoping.
- **Strict**: Enables Leakage Guard and mandatory MFA.
- **Government**: Hard-coded IP whitelisting and accelerated forensic logging.

## ✅ Benefits
- **Zero Leakage**: Guaranteed isolation between Workspace A and Workspace B.
- **Developer Safety**: Middleware handles the complexity, reducing the risk of accidental cross-tenant bugs.
- **Audit Ready**: Every tenant-level violation is logged to the `SecurityEvent` log with forensic metadata.

## 🧪 Verification
Run the isolation test suite:
```bash
npx mocha tests/tenantIsolation.test.js
```
