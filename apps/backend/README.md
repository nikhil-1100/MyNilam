# Rentel — User Roles and Permissions

This document outlines the Authentication and Role-Based Access Control (RBAC) architecture, including the defined roles, permissions matrix, and implementation details for the Rentel platform.

---

## 1. System Roles

The system operates on five primary roles:

| Role | Name | Description |
|---|---|---|
| `GUEST` | Guest / Anonymous | Unauthenticated users visiting the platform. Can search and browse public listings. |
| `NORMAL` | Regular User | General public users who can search properties/hostels, post new ads/listings, submit inquiries, and leave reviews. |
| `HOSTEL_ADMIN` | Hostel Owner/Admin | Registered hostel owners. Access is restricted to their personal Hostel Dashboard. They do not have access to search/browse properties, only to manage their assigned hostels, rooms, vacancy, and bookings. |
| `EMPLOYEE` | Staff / Moderator | Internal workers who can view all listings, post new ads, verify ads/listings, and check/moderate reviews. Have limited administrative access. |
| `SUPER_ADMIN` | Super Administrator | Owner and developer of the application. Full control over the entire platform, configuration, roles, logs, and database. |

---

## 2. Permissions Matrix

The following table maps roles to permitted operations:

| Feature / Resource | Endpoint Path | GUEST | NORMAL | HOSTEL_ADMIN | EMPLOYEE | SUPER_ADMIN |
|---|---|---|---|---|---|---|
| **Browse / Search Properties / Hostels** | `/api/v1/properties` / `/api/v1/hostels` | ✅ View | ✅ View | ❌ (Dashboard Only) | ✅ View | ✅ View |
| **Post Ads / Listings (Create)** | `/api/v1/properties` | ❌ | ✅ | ❌ | ✅ | ✅ |
| **Manage Own Listings** | `/api/v1/properties/:id` | ❌ | ✅ Own | ❌ | ✅ All | ✅ All |
| **Verify / Moderate Ads & Listings** | `/api/v1/admin/listings/:id/verify` | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Manage Hostel Details, Rooms & Vacancy** | `/api/v1/hostels/:id/*` | ❌ | ❌ | ✅ Assigned | ✅ All | ✅ All |
| **Submit Inquiries & Reviews** | `/api/v1/inquiries` / `/api/v1/reviews` | ❌ | ✅ | ❌ | ❌ | ✅ |
| **Check / Moderate Reviews** | `/api/v1/admin/reviews` | ❌ | ❌ | ❌ | ✅ | ✅ |
| **System Stats & User Directory** | `/api/v1/admin/stats` / `/api/v1/admin/users` | ❌ | ❌ | ❌ | ✅ (Limited) | ✅ |
| **Create Employee / Admin Accounts** | `/api/v1/admin/employees` | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Change User Roles / Deactivate** | `/api/v1/admin/users/:id/role` | ❌ | ❌ | ❌ | ❌ | ✅ |


---

## 3. Database Schema Reference

The authorization and RBAC system is modeled in `prisma/schema.prisma` using the following entities:

1. **`AuthUser`**: The central account model holding the `role` field (for simple checks) and pointing to the full RBAC entities.
2. **`RbacRole`**: Defines roles (`SUPER_ADMIN`, `HOSTEL_ADMIN`, etc.).
3. **`RbacPermission`**: Finer-grained permissions for specific features or transitions.
4. **`RbacRolePermission`**: Junction table mapping permissions to roles.
5. **`RbacUserRole`**: Mapped user roles (supports multiple/expiring roles).
6. **`RbacUserPermissionOverride`**: Explicit permissions granted or denied directly to an individual user, bypassing role configurations.

---

## 4. Implementation Details

Access control is enforced via Express middleware defined in `src/middlewares/role.middleware.ts`.

### Example Route Usage

* **Role Protection:**
  ```typescript
  import { requireRole } from '../middlewares/role.middleware';
  
  // Only accessible by Super Admins and Employees
  router.get('/admin/stats', requireRole('SUPER_ADMIN', 'EMPLOYEE'), getStats);
  ```

* **Ownership + Role Override Protection:**
  ```typescript
  import { requireOwnerOrRole } from '../middlewares/role.middleware';
  
  // Accessible if the user is the owner OR is a Super Admin
  router.delete('/properties/:id', requireOwnerOrRole(property.userId, 'SUPER_ADMIN'), deleteProperty);
  ```

* **Assigned Hostel Protection:**
  ```typescript
  import { requireHostelAdmin } from '../middlewares/role.middleware';
  
  // Only accessible if the user is the assigned administrator for this hostel
  router.put('/hostels/:id/rooms', requireHostelAdmin(hostelId), updateRooms);
  ```
