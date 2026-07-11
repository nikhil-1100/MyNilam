-- CreateTable
CREATE TABLE "geo_countries" (
    "CountryID" SERIAL NOT NULL,
    "CountryName" VARCHAR(100) NOT NULL,
    "CountryCode" CHAR(2) NOT NULL,
    "CurrencyCode" CHAR(3),
    "PhoneCode" VARCHAR(10),
    "RowGUID" UUID NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT false,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" BIGINT,
    "ModifiedDate" TIMESTAMP(3),
    "ModifiedBy" BIGINT,

    CONSTRAINT "geo_countries_pkey" PRIMARY KEY ("CountryID")
);

-- CreateTable
CREATE TABLE "geo_states" (
    "StateID" SERIAL NOT NULL,
    "CountryID" INTEGER NOT NULL,
    "StateName" VARCHAR(100) NOT NULL,
    "StateCode" VARCHAR(10),
    "RowGUID" UUID NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT false,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" BIGINT,
    "ModifiedDate" TIMESTAMP(3),
    "ModifiedBy" BIGINT,

    CONSTRAINT "geo_states_pkey" PRIMARY KEY ("StateID")
);

-- CreateTable
CREATE TABLE "geo_districts" (
    "DistrictID" SERIAL NOT NULL,
    "StateID" INTEGER NOT NULL,
    "DistrictName" VARCHAR(100) NOT NULL,
    "RowGUID" UUID NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT false,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" BIGINT,
    "ModifiedDate" TIMESTAMP(3),
    "ModifiedBy" BIGINT,

    CONSTRAINT "geo_districts_pkey" PRIMARY KEY ("DistrictID")
);

-- CreateTable
CREATE TABLE "geo_cities" (
    "CityID" SERIAL NOT NULL,
    "DistrictID" INTEGER NOT NULL,
    "CityName" VARCHAR(150) NOT NULL,
    "Latitude" DECIMAL(10,8),
    "Longitude" DECIMAL(11,8),
    "RowGUID" UUID NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT false,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" BIGINT,
    "ModifiedDate" TIMESTAMP(3),
    "ModifiedBy" BIGINT,

    CONSTRAINT "geo_cities_pkey" PRIMARY KEY ("CityID")
);

-- CreateTable
CREATE TABLE "geo_areas" (
    "AreaID" SERIAL NOT NULL,
    "CityID" INTEGER NOT NULL,
    "AreaName" VARCHAR(150) NOT NULL,
    "ZipCode" VARCHAR(20),
    "RowGUID" UUID NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT false,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" BIGINT,
    "ModifiedDate" TIMESTAMP(3),
    "ModifiedBy" BIGINT,

    CONSTRAINT "geo_areas_pkey" PRIMARY KEY ("AreaID")
);

-- CreateTable
CREATE TABLE "geo_localities" (
    "LocalityID" SERIAL NOT NULL,
    "AreaID" INTEGER NOT NULL,
    "LocalityName" VARCHAR(200) NOT NULL,
    "RowGUID" UUID NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT false,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" BIGINT,
    "ModifiedDate" TIMESTAMP(3),
    "ModifiedBy" BIGINT,

    CONSTRAINT "geo_localities_pkey" PRIMARY KEY ("LocalityID")
);

-- CreateTable
CREATE TABLE "auth_users" (
    "UserID" BIGSERIAL NOT NULL,
    "UserGUID" UUID NOT NULL,
    "Email" VARCHAR(256) NOT NULL,
    "PasswordHash" VARCHAR(500) NOT NULL,
    "SecurityStamp" VARCHAR(500) NOT NULL,
    "TwoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "LockoutEndDate" TIMESTAMP(3),
    "LockoutEnabled" BOOLEAN NOT NULL DEFAULT true,
    "AccessFailedCount" INTEGER NOT NULL DEFAULT 0,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT false,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" BIGINT,
    "ModifiedDate" TIMESTAMP(3),
    "ModifiedBy" BIGINT,
    "DeletedDate" TIMESTAMP(3),
    "DeletedBy" BIGINT,

    CONSTRAINT "auth_users_pkey" PRIMARY KEY ("UserID")
);

-- CreateTable
CREATE TABLE "auth_user_profiles" (
    "UserProfileID" BIGSERIAL NOT NULL,
    "UserID" BIGINT NOT NULL,
    "FirstName" VARCHAR(100),
    "LastName" VARCHAR(100),
    "DisplayName" VARCHAR(200),
    "DateOfBirth" DATE,
    "ProfilePictureURL" VARCHAR(2000),
    "PhoneNumber" VARCHAR(20),
    "PhoneNumberConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "EmailConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "PreferredLanguage" VARCHAR(10) DEFAULT 'en',
    "Bio" VARCHAR(2000),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT false,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" BIGINT,
    "ModifiedDate" TIMESTAMP(3),
    "ModifiedBy" BIGINT,
    "DeletedDate" TIMESTAMP(3),
    "DeletedBy" BIGINT,

    CONSTRAINT "auth_user_profiles_pkey" PRIMARY KEY ("UserProfileID")
);

-- CreateTable
CREATE TABLE "auth_user_password_history" (
    "PasswordHistoryID" BIGSERIAL NOT NULL,
    "UserID" BIGINT NOT NULL,
    "PasswordHash" VARCHAR(500) NOT NULL,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_user_password_history_pkey" PRIMARY KEY ("PasswordHistoryID")
);

-- CreateTable
CREATE TABLE "auth_refresh_tokens" (
    "RefreshTokenID" BIGSERIAL NOT NULL,
    "UserID" BIGINT NOT NULL,
    "TokenHash" CHAR(64) NOT NULL,
    "DeviceID" BIGINT,
    "ExpiresDate" TIMESTAMP(3) NOT NULL,
    "IsRevoked" BOOLEAN NOT NULL DEFAULT false,
    "RevokedDate" TIMESTAMP(3),
    "CreatedByIP" VARCHAR(45),
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_refresh_tokens_pkey" PRIMARY KEY ("RefreshTokenID")
);

-- CreateTable
CREATE TABLE "auth_user_devices" (
    "DeviceID" BIGSERIAL NOT NULL,
    "UserID" BIGINT NOT NULL,
    "DeviceGUID" UUID NOT NULL,
    "DeviceName" VARCHAR(200),
    "DeviceType" VARCHAR(50),
    "OperatingSystem" VARCHAR(100),
    "ClientApp" VARCHAR(100),
    "DeviceFingerprint" VARCHAR(255),
    "LastIPAddress" VARCHAR(45),
    "LastLoginDate" TIMESTAMP(3),
    "IsTrusted" BOOLEAN NOT NULL DEFAULT false,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_user_devices_pkey" PRIMARY KEY ("DeviceID")
);

-- CreateTable
CREATE TABLE "auth_login_history" (
    "LoginHistoryID" BIGSERIAL NOT NULL,
    "UserID" BIGINT,
    "DeviceID" BIGINT,
    "LoginEmail" VARCHAR(256) NOT NULL,
    "LoginStatus" VARCHAR(20) NOT NULL,
    "FailureReason" VARCHAR(200),
    "IPAddress" VARCHAR(45),
    "UserAgent" VARCHAR(500),
    "LocationGeo" VARCHAR(200),
    "LoginDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_login_history_pkey" PRIMARY KEY ("LoginHistoryID")
);

-- CreateTable
CREATE TABLE "auth_user_otp" (
    "OTPID" BIGSERIAL NOT NULL,
    "UserID" BIGINT NOT NULL,
    "OTPHash" CHAR(64) NOT NULL,
    "OTPType" VARCHAR(20) NOT NULL,
    "Purpose" VARCHAR(50) NOT NULL,
    "ExpiresDate" TIMESTAMP(3) NOT NULL,
    "AttemptCount" INTEGER NOT NULL DEFAULT 0,
    "MaxAttempts" INTEGER NOT NULL DEFAULT 5,
    "IsValidated" BOOLEAN NOT NULL DEFAULT false,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_user_otp_pkey" PRIMARY KEY ("OTPID")
);

-- CreateTable
CREATE TABLE "auth_account_locks" (
    "AccountLockID" BIGSERIAL NOT NULL,
    "UserID" BIGINT NOT NULL,
    "LockReason" VARCHAR(200),
    "LockedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UnlockDate" TIMESTAMP(3),
    "UnlockedBy" BIGINT,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "auth_account_locks_pkey" PRIMARY KEY ("AccountLockID")
);

-- CreateTable
CREATE TABLE "auth_two_factor_methods" (
    "TwoFactorMethodID" BIGSERIAL NOT NULL,
    "UserID" BIGINT NOT NULL,
    "MethodType" VARCHAR(20) NOT NULL,
    "MethodData" TEXT,
    "IsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "IsDefault" BOOLEAN NOT NULL DEFAULT false,
    "LastUsedDate" TIMESTAMP(3),
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_two_factor_methods_pkey" PRIMARY KEY ("TwoFactorMethodID")
);

-- CreateTable
CREATE TABLE "rbac_permission_categories" (
    "PermissionCategoryID" SERIAL NOT NULL,
    "CategoryName" VARCHAR(100) NOT NULL,
    "CategoryCode" VARCHAR(50) NOT NULL,
    "Description" VARCHAR(500),
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "Icon" VARCHAR(100),

    CONSTRAINT "rbac_permission_categories_pkey" PRIMARY KEY ("PermissionCategoryID")
);

-- CreateTable
CREATE TABLE "rbac_permissions" (
    "PermissionID" SERIAL NOT NULL,
    "PermissionCategoryID" INTEGER NOT NULL,
    "PermissionName" VARCHAR(200) NOT NULL,
    "Code" VARCHAR(200) NOT NULL,
    "Description" VARCHAR(500),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "rbac_permissions_pkey" PRIMARY KEY ("PermissionID")
);

-- CreateTable
CREATE TABLE "rbac_roles" (
    "RoleID" SERIAL NOT NULL,
    "RoleName" VARCHAR(100) NOT NULL,
    "RoleCode" VARCHAR(50) NOT NULL,
    "Description" VARCHAR(500),
    "IsSystemRole" BOOLEAN NOT NULL DEFAULT false,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "RowGUID" UUID NOT NULL,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT false,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" BIGINT,
    "ModifiedDate" TIMESTAMP(3),
    "ModifiedBy" BIGINT,

    CONSTRAINT "rbac_roles_pkey" PRIMARY KEY ("RoleID")
);

-- CreateTable
CREATE TABLE "rbac_role_permissions" (
    "RolePermissionID" SERIAL NOT NULL,
    "RoleID" INTEGER NOT NULL,
    "PermissionID" INTEGER NOT NULL,

    CONSTRAINT "rbac_role_permissions_pkey" PRIMARY KEY ("RolePermissionID")
);

-- CreateTable
CREATE TABLE "rbac_user_roles" (
    "UserRoleID" BIGSERIAL NOT NULL,
    "UserID" BIGINT NOT NULL,
    "RoleID" INTEGER NOT NULL,
    "AssignedBy" BIGINT,
    "AssignedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ExpiryDate" TIMESTAMP(3),

    CONSTRAINT "rbac_user_roles_pkey" PRIMARY KEY ("UserRoleID")
);

-- CreateTable
CREATE TABLE "rbac_user_permission_overrides" (
    "UserPermissionOverrideID" BIGSERIAL NOT NULL,
    "UserID" BIGINT NOT NULL,
    "PermissionID" INTEGER NOT NULL,
    "IsGranted" BOOLEAN NOT NULL,
    "AssignedBy" BIGINT,
    "Reason" VARCHAR(500),
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rbac_user_permission_overrides_pkey" PRIMARY KEY ("UserPermissionOverrideID")
);

-- CreateTable
CREATE TABLE "rbac_permission_audit" (
    "AuditID" BIGSERIAL NOT NULL,
    "UserID" BIGINT,
    "ActionType" VARCHAR(50) NOT NULL,
    "OldValue" TEXT,
    "NewValue" TEXT NOT NULL,
    "ChangedBy" BIGINT,
    "ChangedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rbac_permission_audit_pkey" PRIMARY KEY ("AuditID")
);

-- CreateTable
CREATE TABLE "org_organizations" (
    "OrganizationID" BIGSERIAL NOT NULL,
    "OrganizationGUID" UUID NOT NULL,
    "PrimaryContactUserID" BIGINT NOT NULL,
    "CompanyName" VARCHAR(200) NOT NULL,
    "LegalName" VARCHAR(200),
    "TaxID" VARCHAR(50),
    "RegistrationNumber" VARCHAR(100),
    "BusinessType" VARCHAR(50),
    "Website" VARCHAR(500),
    "LogoURL" VARCHAR(2000),
    "Description" TEXT,
    "VerificationStatus" VARCHAR(20) NOT NULL DEFAULT 'Pending',
    "VerifiedBy" BIGINT,
    "VerifiedDate" TIMESTAMP(3),
    "RejectionReason" VARCHAR(1000),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT false,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" BIGINT,
    "ModifiedDate" TIMESTAMP(3),
    "ModifiedBy" BIGINT,
    "DeletedDate" TIMESTAMP(3),
    "DeletedBy" BIGINT,

    CONSTRAINT "org_organizations_pkey" PRIMARY KEY ("OrganizationID")
);

-- CreateTable
CREATE TABLE "org_organization_members" (
    "OrganizationMemberID" BIGSERIAL NOT NULL,
    "OrganizationID" BIGINT NOT NULL,
    "UserID" BIGINT NOT NULL,
    "MemberRole" VARCHAR(50) NOT NULL DEFAULT 'Agent',
    "CanPublishListings" BOOLEAN NOT NULL DEFAULT true,
    "JoinedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "org_organization_members_pkey" PRIMARY KEY ("OrganizationMemberID")
);

-- CreateTable
CREATE TABLE "org_organization_documents" (
    "DocumentID" BIGSERIAL NOT NULL,
    "OrganizationID" BIGINT NOT NULL,
    "DocumentType" VARCHAR(50) NOT NULL,
    "DocumentURL" VARCHAR(2000) NOT NULL,
    "FileName" VARCHAR(500) NOT NULL,
    "FileSizeKB" INTEGER,
    "IsVerified" BOOLEAN NOT NULL DEFAULT false,
    "ExpiryDate" DATE,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "org_organization_documents_pkey" PRIMARY KEY ("DocumentID")
);

-- CreateTable
CREATE TABLE "verif_user_verifications" (
    "VerificationID" BIGSERIAL NOT NULL,
    "UserID" BIGINT NOT NULL,
    "VerificationType" VARCHAR(50) NOT NULL,
    "VerificationData" TEXT,
    "Status" VARCHAR(20) NOT NULL DEFAULT 'Pending',
    "ReviewerUserID" BIGINT,
    "ReviewNotes" VARCHAR(1000),
    "ReviewedDate" TIMESTAMP(3),
    "ExpiryDate" TIMESTAMP(3),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT false,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" BIGINT,
    "ModifiedDate" TIMESTAMP(3),
    "ModifiedBy" BIGINT,

    CONSTRAINT "verif_user_verifications_pkey" PRIMARY KEY ("VerificationID")
);

-- CreateTable
CREATE TABLE "verif_verification_documents" (
    "VerificationDocumentID" BIGSERIAL NOT NULL,
    "VerificationID" BIGINT NOT NULL,
    "DocumentType" VARCHAR(50) NOT NULL,
    "DocumentURL" VARCHAR(2000) NOT NULL,
    "FileName" VARCHAR(500) NOT NULL,
    "FileSizeKB" INTEGER,
    "FaceMatchScore" DECIMAL(5,2),
    "OCRData" TEXT,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verif_verification_documents_pkey" PRIMARY KEY ("VerificationDocumentID")
);

-- CreateTable
CREATE TABLE "verif_verification_history" (
    "HistoryID" BIGSERIAL NOT NULL,
    "VerificationID" BIGINT NOT NULL,
    "FromStatus" VARCHAR(20),
    "ToStatus" VARCHAR(20) NOT NULL,
    "ChangedBy" BIGINT NOT NULL,
    "Comment" VARCHAR(1000),
    "ChangedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verif_verification_history_pkey" PRIMARY KEY ("HistoryID")
);

-- CreateTable
CREATE TABLE "mast_master_groups" (
    "MasterGroupID" SERIAL NOT NULL,
    "GroupCode" VARCHAR(50) NOT NULL,
    "GroupName" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(500),
    "IsEditable" BOOLEAN NOT NULL DEFAULT true,
    "IsMultiple" BOOLEAN NOT NULL DEFAULT true,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "mast_master_groups_pkey" PRIMARY KEY ("MasterGroupID")
);

-- CreateTable
CREATE TABLE "mast_master_items" (
    "MasterItemID" SERIAL NOT NULL,
    "MasterGroupID" INTEGER NOT NULL,
    "ItemCode" VARCHAR(50) NOT NULL,
    "ItemName" VARCHAR(200) NOT NULL,
    "IconURL" VARCHAR(2000),
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT false,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" BIGINT,
    "ModifiedDate" TIMESTAMP(3),
    "ModifiedBy" BIGINT,

    CONSTRAINT "mast_master_items_pkey" PRIMARY KEY ("MasterItemID")
);

-- CreateTable
CREATE TABLE "list_categories" (
    "CategoryID" SERIAL NOT NULL,
    "CategoryName" VARCHAR(100) NOT NULL,
    "ParentCategoryID" INTEGER,
    "Slug" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(500),
    "ListingType" VARCHAR(20) NOT NULL,
    "IconURL" VARCHAR(2000),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "list_categories_pkey" PRIMARY KEY ("CategoryID")
);

-- CreateTable
CREATE TABLE "list_listings" (
    "ListingID" BIGSERIAL NOT NULL,
    "ListingGUID" UUID NOT NULL,
    "UserID" BIGINT NOT NULL,
    "OrganizationID" BIGINT,
    "CategoryID" INTEGER NOT NULL,
    "Title" VARCHAR(500) NOT NULL,
    "Description" TEXT,
    "Purpose" VARCHAR(20) NOT NULL,
    "Price" DECIMAL(18,2),
    "PriceCurrency" CHAR(3) NOT NULL DEFAULT 'USD',
    "IsPriceNegotiable" BOOLEAN NOT NULL DEFAULT false,
    "Deposit" DECIMAL(18,2),
    "Area" DECIMAL(10,2),
    "AreaUnitID" INTEGER,
    "Bedrooms" SMALLINT,
    "Bathrooms" SMALLINT,
    "TotalRooms" SMALLINT,
    "FloorNumber" SMALLINT,
    "TotalFloors" SMALLINT,
    "ConstructionYear" SMALLINT,
    "AvailableFrom" DATE,
    "PropertyConditionID" INTEGER,
    "OwnershipTypeID" INTEGER,
    "Latitude" DECIMAL(10,8),
    "Longitude" DECIMAL(11,8),
    "StreetAddress" VARCHAR(500),
    "LocalityID" INTEGER,
    "ZipCode" VARCHAR(20),
    "Slug" VARCHAR(600) NOT NULL,
    "Status" VARCHAR(20) NOT NULL DEFAULT 'Draft',
    "ViewCount" INTEGER NOT NULL DEFAULT 0,
    "InquiryCount" INTEGER NOT NULL DEFAULT 0,
    "IsFeatured" BOOLEAN NOT NULL DEFAULT false,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT false,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" BIGINT,
    "ModifiedDate" TIMESTAMP(3),
    "ModifiedBy" BIGINT,
    "DeletedDate" TIMESTAMP(3),
    "DeletedBy" BIGINT,

    CONSTRAINT "list_listings_pkey" PRIMARY KEY ("ListingID")
);

-- CreateTable
CREATE TABLE "list_listing_features" (
    "ListingFeatureID" BIGSERIAL NOT NULL,
    "ListingID" BIGINT NOT NULL,
    "MasterItemID" INTEGER NOT NULL,
    "CustomValue" VARCHAR(200),

    CONSTRAINT "list_listing_features_pkey" PRIMARY KEY ("ListingFeatureID")
);

-- CreateTable
CREATE TABLE "list_listing_nearby_places" (
    "NearbyPlaceID" BIGSERIAL NOT NULL,
    "ListingID" BIGINT NOT NULL,
    "PlaceTypeID" INTEGER NOT NULL,
    "DistanceInMeters" INTEGER,
    "PlaceName" VARCHAR(200),

    CONSTRAINT "list_listing_nearby_places_pkey" PRIMARY KEY ("NearbyPlaceID")
);

-- CreateTable
CREATE TABLE "list_listing_restrictions" (
    "RestrictionID" BIGSERIAL NOT NULL,
    "ListingID" BIGINT NOT NULL,
    "RestrictionTypeID" INTEGER NOT NULL,

    CONSTRAINT "list_listing_restrictions_pkey" PRIMARY KEY ("RestrictionID")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "AssetID" BIGSERIAL NOT NULL,
    "ListingID" BIGINT NOT NULL,
    "AssetType" VARCHAR(20) NOT NULL,
    "FileName" VARCHAR(500) NOT NULL,
    "OriginalFileName" VARCHAR(500),
    "FileSizeKB" INTEGER,
    "MimeType" VARCHAR(100),
    "StorageProvider" VARCHAR(50),
    "StoragePath" VARCHAR(2000) NOT NULL,
    "ThumbnailPath" VARCHAR(2000),
    "IsPrimary" BOOLEAN NOT NULL DEFAULT false,
    "DisplayOrder" INTEGER NOT NULL DEFAULT 0,
    "Title" VARCHAR(200),
    "Description" VARCHAR(500),
    "Width" INTEGER,
    "Height" INTEGER,
    "Duration" INTEGER,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT false,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" BIGINT,
    "ModifiedDate" TIMESTAMP(3),
    "ModifiedBy" BIGINT,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("AssetID")
);

-- CreateTable
CREATE TABLE "wflow_statuses" (
    "StatusID" SERIAL NOT NULL,
    "StatusCode" VARCHAR(20) NOT NULL,
    "StatusName" VARCHAR(50) NOT NULL,
    "EntityType" VARCHAR(50) NOT NULL,
    "ColorCode" VARCHAR(7),
    "IsInitial" BOOLEAN NOT NULL DEFAULT false,
    "IsFinal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "wflow_statuses_pkey" PRIMARY KEY ("StatusID")
);

-- CreateTable
CREATE TABLE "wflow_transitions" (
    "TransitionID" SERIAL NOT NULL,
    "EntityType" VARCHAR(50) NOT NULL,
    "FromStatusID" INTEGER NOT NULL,
    "ToStatusID" INTEGER NOT NULL,
    "RequiredPermissionID" INTEGER,
    "IsAutomatic" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "wflow_transitions_pkey" PRIMARY KEY ("TransitionID")
);

-- CreateTable
CREATE TABLE "wflow_workflow_history" (
    "WorkflowHistoryID" BIGSERIAL NOT NULL,
    "EntityType" VARCHAR(50) NOT NULL,
    "EntityID" BIGINT NOT NULL,
    "FromStatusID" INTEGER,
    "ToStatusID" INTEGER NOT NULL,
    "ActionBy" BIGINT NOT NULL,
    "Comment" VARCHAR(1000),
    "TransitionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wflow_workflow_history_pkey" PRIMARY KEY ("WorkflowHistoryID")
);

-- CreateTable
CREATE TABLE "sub_plans" (
    "PlanID" SERIAL NOT NULL,
    "PlanName" VARCHAR(100) NOT NULL,
    "PlanCode" VARCHAR(20) NOT NULL,
    "MonthlyPrice" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "YearlyPrice" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "Currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "ListingLimit" INTEGER NOT NULL DEFAULT 5,
    "BoostCreditsPerMonth" INTEGER NOT NULL DEFAULT 0,
    "PriorityRanking" INTEGER NOT NULL DEFAULT 0,
    "HasVerifiedBadge" BOOLEAN NOT NULL DEFAULT false,
    "Description" VARCHAR(500),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sub_plans_pkey" PRIMARY KEY ("PlanID")
);

-- CreateTable
CREATE TABLE "sub_plan_features" (
    "PlanFeatureID" SERIAL NOT NULL,
    "PlanID" INTEGER NOT NULL,
    "FeatureID" INTEGER NOT NULL,
    "FeatureValue" VARCHAR(200),

    CONSTRAINT "sub_plan_features_pkey" PRIMARY KEY ("PlanFeatureID")
);

-- CreateTable
CREATE TABLE "sub_user_subscriptions" (
    "SubscriptionID" BIGSERIAL NOT NULL,
    "UserID" BIGINT NOT NULL,
    "PlanID" INTEGER NOT NULL,
    "StartDate" TIMESTAMP(3) NOT NULL,
    "EndDate" TIMESTAMP(3) NOT NULL,
    "IsAutoRenew" BOOLEAN NOT NULL DEFAULT false,
    "Status" VARCHAR(20) NOT NULL DEFAULT 'Active',
    "CancelledDate" TIMESTAMP(3),
    "PaymentTransactionID" BIGINT,
    "BoostCreditsRemaining" INTEGER NOT NULL DEFAULT 0,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT false,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" BIGINT,
    "ModifiedDate" TIMESTAMP(3),
    "ModifiedBy" BIGINT,

    CONSTRAINT "sub_user_subscriptions_pkey" PRIMARY KEY ("SubscriptionID")
);

-- CreateTable
CREATE TABLE "sub_listing_boosts" (
    "BoostID" BIGSERIAL NOT NULL,
    "ListingID" BIGINT NOT NULL,
    "SubscriptionID" BIGINT,
    "BoostType" VARCHAR(20) NOT NULL,
    "StartDate" TIMESTAMP(3) NOT NULL,
    "EndDate" TIMESTAMP(3) NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sub_listing_boosts_pkey" PRIMARY KEY ("BoostID")
);

-- CreateTable
CREATE TABLE "pay_payment_gateways" (
    "GatewayID" SERIAL NOT NULL,
    "GatewayName" VARCHAR(100) NOT NULL,
    "GatewayCode" VARCHAR(20) NOT NULL,
    "Configuration" TEXT,
    "SupportedCurrencies" VARCHAR(500),
    "SupportedCountries" VARCHAR(500),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "WebhookURL" VARCHAR(2000),
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pay_payment_gateways_pkey" PRIMARY KEY ("GatewayID")
);

-- CreateTable
CREATE TABLE "pay_transactions" (
    "TransactionID" BIGSERIAL NOT NULL,
    "TransactionGUID" UUID NOT NULL,
    "UserID" BIGINT NOT NULL,
    "GatewayID" INTEGER NOT NULL,
    "EntityType" VARCHAR(50) NOT NULL,
    "EntityID" BIGINT NOT NULL,
    "Amount" DECIMAL(18,2) NOT NULL,
    "Currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "TaxAmount" DECIMAL(18,2) DEFAULT 0.00,
    "TotalAmount" DECIMAL(18,2) NOT NULL,
    "Status" VARCHAR(20) NOT NULL DEFAULT 'Initiated',
    "GatewayTransactionID" VARCHAR(200),
    "GatewayResponse" TEXT,
    "FailureReason" VARCHAR(500),
    "TransactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CompletedDate" TIMESTAMP(3),
    "IPAddress" VARCHAR(45),

    CONSTRAINT "pay_transactions_pkey" PRIMARY KEY ("TransactionID")
);

-- CreateTable
CREATE TABLE "pay_invoices" (
    "InvoiceID" BIGSERIAL NOT NULL,
    "InvoiceNumber" VARCHAR(50) NOT NULL,
    "TransactionID" BIGINT NOT NULL,
    "UserID" BIGINT NOT NULL,
    "InvoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DueDate" TIMESTAMP(3),
    "InvoiceData" TEXT,
    "InvoiceURL" VARCHAR(2000),
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pay_invoices_pkey" PRIMARY KEY ("InvoiceID")
);

-- CreateTable
CREATE TABLE "pay_refunds" (
    "RefundID" BIGSERIAL NOT NULL,
    "TransactionID" BIGINT NOT NULL,
    "RefundAmount" DECIMAL(18,2) NOT NULL,
    "RefundReason" VARCHAR(500),
    "Status" VARCHAR(20) NOT NULL DEFAULT 'Pending',
    "GatewayRefundID" VARCHAR(200),
    "ProcessedDate" TIMESTAMP(3),
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" BIGINT NOT NULL,

    CONSTRAINT "pay_refunds_pkey" PRIMARY KEY ("RefundID")
);

-- CreateTable
CREATE TABLE "ad_campaigns" (
    "CampaignID" BIGSERIAL NOT NULL,
    "CampaignName" VARCHAR(200) NOT NULL,
    "AdvertiserID" BIGINT,
    "CampaignType" VARCHAR(20) NOT NULL,
    "Budget" DECIMAL(18,2),
    "DailyBudget" DECIMAL(18,2),
    "StartDate" TIMESTAMP(3) NOT NULL,
    "EndDate" TIMESTAMP(3) NOT NULL,
    "TargetURL" VARCHAR(2000),
    "Status" VARCHAR(20) NOT NULL DEFAULT 'Draft',
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" BIGINT,

    CONSTRAINT "ad_campaigns_pkey" PRIMARY KEY ("CampaignID")
);

-- CreateTable
CREATE TABLE "ad_banners" (
    "BannerID" BIGSERIAL NOT NULL,
    "CampaignID" BIGINT NOT NULL,
    "BannerName" VARCHAR(200) NOT NULL,
    "Placement" VARCHAR(50) NOT NULL,
    "ImageURL" VARCHAR(2000) NOT NULL,
    "TargetURL" VARCHAR(2000),
    "AltText" VARCHAR(500),
    "Priority" INTEGER NOT NULL DEFAULT 0,
    "TotalClicks" BIGINT NOT NULL DEFAULT 0,
    "TotalImpressions" BIGINT NOT NULL DEFAULT 0,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_banners_pkey" PRIMARY KEY ("BannerID")
);

-- CreateTable
CREATE TABLE "ad_analytics" (
    "AdAnalyticID" BIGSERIAL NOT NULL,
    "BannerID" BIGINT NOT NULL,
    "EventDate" DATE NOT NULL,
    "Impressions" INTEGER NOT NULL DEFAULT 0,
    "Clicks" INTEGER NOT NULL DEFAULT 0,
    "CTR" DECIMAL(7,4) NOT NULL DEFAULT 0,
    "Spend" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "ad_analytics_pkey" PRIMARY KEY ("AdAnalyticID")
);

-- CreateTable
CREATE TABLE "serv_service_categories" (
    "ServiceCategoryID" SERIAL NOT NULL,
    "CategoryCode" VARCHAR(50) NOT NULL,
    "CategoryName" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(500),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "serv_service_categories_pkey" PRIMARY KEY ("ServiceCategoryID")
);

-- CreateTable
CREATE TABLE "serv_services" (
    "ServiceID" SERIAL NOT NULL,
    "ServiceCategoryID" INTEGER NOT NULL,
    "ServiceCode" VARCHAR(50) NOT NULL,
    "ServiceName" VARCHAR(200) NOT NULL,
    "Description" TEXT,
    "BasePrice" DECIMAL(18,2) NOT NULL,
    "Currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "serv_services_pkey" PRIMARY KEY ("ServiceID")
);

-- CreateTable
CREATE TABLE "serv_service_requests" (
    "ServiceRequestID" BIGSERIAL NOT NULL,
    "UserID" BIGINT NOT NULL,
    "ServiceID" INTEGER NOT NULL,
    "ListingID" BIGINT,
    "RequestedPrice" DECIMAL(18,2) NOT NULL,
    "Status" VARCHAR(20) NOT NULL DEFAULT 'Pending',
    "RequestData" TEXT,
    "AssignedTo" BIGINT,
    "CompletedDate" TIMESTAMP(3),
    "TransactionID" BIGINT,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "serv_service_requests_pkey" PRIMARY KEY ("ServiceRequestID")
);

-- CreateTable
CREATE TABLE "chat_conversations" (
    "ConversationID" BIGSERIAL NOT NULL,
    "ConversationGUID" UUID NOT NULL,
    "SubjectEntityType" VARCHAR(50) NOT NULL,
    "SubjectEntityID" BIGINT NOT NULL,
    "InitiatedBy" BIGINT NOT NULL,
    "LastMessageDate" TIMESTAMP(3),
    "LastMessagePreview" VARCHAR(200),
    "MessageCount" INTEGER NOT NULL DEFAULT 0,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_conversations_pkey" PRIMARY KEY ("ConversationID")
);

-- CreateTable
CREATE TABLE "chat_conversation_participants" (
    "ParticipantID" BIGSERIAL NOT NULL,
    "ConversationID" BIGINT NOT NULL,
    "UserID" BIGINT NOT NULL,
    "LastReadDate" TIMESTAMP(3),
    "IsMuted" BOOLEAN NOT NULL DEFAULT false,
    "JoinedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_conversation_participants_pkey" PRIMARY KEY ("ParticipantID")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "MessageID" BIGSERIAL NOT NULL,
    "ConversationID" BIGINT NOT NULL,
    "SenderUserID" BIGINT NOT NULL,
    "MessageContent" TEXT,
    "AttachmentURL" VARCHAR(2000),
    "AttachmentType" VARCHAR(50),
    "SentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ReadDate" TIMESTAMP(3),
    "IsEdited" BOOLEAN NOT NULL DEFAULT false,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("MessageID")
);

-- CreateTable
CREATE TABLE "notify_templates" (
    "TemplateID" SERIAL NOT NULL,
    "TemplateCode" VARCHAR(100) NOT NULL,
    "TemplateName" VARCHAR(200) NOT NULL,
    "Subject" VARCHAR(500),
    "BodyHTML" TEXT,
    "BodyText" TEXT,
    "SupportedChannels" VARCHAR(100) NOT NULL DEFAULT 'Email,SMS,Push,InApp',
    "Variables" TEXT,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notify_templates_pkey" PRIMARY KEY ("TemplateID")
);

-- CreateTable
CREATE TABLE "notify_queue" (
    "NotificationID" BIGSERIAL NOT NULL,
    "UserID" BIGINT NOT NULL,
    "TemplateID" INTEGER NOT NULL,
    "Channel" VARCHAR(20) NOT NULL,
    "Recipient" VARCHAR(500) NOT NULL,
    "Data" TEXT,
    "Status" VARCHAR(20) NOT NULL DEFAULT 'Pending',
    "SentDate" TIMESTAMP(3),
    "RetryCount" INTEGER NOT NULL DEFAULT 0,
    "ErrorMessage" VARCHAR(500),
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notify_queue_pkey" PRIMARY KEY ("NotificationID")
);

-- CreateTable
CREATE TABLE "notify_preferences" (
    "PreferenceID" BIGSERIAL NOT NULL,
    "UserID" BIGINT NOT NULL,
    "NotificationType" VARCHAR(50) NOT NULL,
    "Channel" VARCHAR(20) NOT NULL,
    "IsEnabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "notify_preferences_pkey" PRIMARY KEY ("PreferenceID")
);

-- CreateTable
CREATE TABLE "wish_wishlist" (
    "WishlistID" BIGSERIAL NOT NULL,
    "UserID" BIGINT NOT NULL,
    "ListingID" BIGINT NOT NULL,
    "Notes" VARCHAR(500),
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wish_wishlist_pkey" PRIMARY KEY ("WishlistID")
);

-- CreateTable
CREATE TABLE "wish_saved_searches" (
    "SavedSearchID" BIGSERIAL NOT NULL,
    "UserID" BIGINT NOT NULL,
    "SearchName" VARCHAR(200),
    "SearchCriteria" TEXT NOT NULL,
    "AlertFrequency" VARCHAR(20),
    "LastNotifiedDate" TIMESTAMP(3),
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wish_saved_searches_pkey" PRIMARY KEY ("SavedSearchID")
);

-- CreateTable
CREATE TABLE "wish_recently_viewed" (
    "ViewID" BIGSERIAL NOT NULL,
    "UserID" BIGINT NOT NULL,
    "ListingID" BIGINT NOT NULL,
    "ViewedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ViewDuration" INTEGER,

    CONSTRAINT "wish_recently_viewed_pkey" PRIMARY KEY ("ViewID")
);

-- CreateTable
CREATE TABLE "review_reviews" (
    "ReviewID" BIGSERIAL NOT NULL,
    "ReviewedByUserID" BIGINT NOT NULL,
    "ReviewedEntityType" VARCHAR(20) NOT NULL,
    "ReviewedEntityID" BIGINT NOT NULL,
    "ListingID" BIGINT,
    "Rating" SMALLINT NOT NULL,
    "Comment" VARCHAR(2000),
    "IsVerified" BOOLEAN NOT NULL DEFAULT false,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ModifiedDate" TIMESTAMP(3),

    CONSTRAINT "review_reviews_pkey" PRIMARY KEY ("ReviewID")
);

-- CreateTable
CREATE TABLE "audit_entity_changes" (
    "AuditID" BIGSERIAL NOT NULL,
    "EntityType" VARCHAR(50) NOT NULL,
    "EntityID" BIGINT NOT NULL,
    "ActionType" VARCHAR(20) NOT NULL,
    "OldValues" TEXT,
    "NewValues" TEXT,
    "ChangedBy" BIGINT,
    "ChangedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "IPAddress" VARCHAR(45),
    "SessionID" UUID,

    CONSTRAINT "audit_entity_changes_pkey" PRIMARY KEY ("AuditID")
);

-- CreateTable
CREATE TABLE "audit_field_changes" (
    "FieldChangeID" BIGSERIAL NOT NULL,
    "AuditID" BIGINT NOT NULL,
    "FieldName" VARCHAR(200) NOT NULL,
    "OldValue" TEXT,
    "NewValue" TEXT,

    CONSTRAINT "audit_field_changes_pkey" PRIMARY KEY ("FieldChangeID")
);

-- CreateTable
CREATE TABLE "actv_activity_log" (
    "ActivityID" BIGSERIAL NOT NULL,
    "UserID" BIGINT NOT NULL,
    "ActivityType" VARCHAR(50) NOT NULL,
    "ActivityDescription" VARCHAR(500),
    "EntityType" VARCHAR(50),
    "EntityID" BIGINT,
    "Details" TEXT,
    "IPAddress" VARCHAR(45),
    "DeviceID" BIGINT,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actv_activity_log_pkey" PRIMARY KEY ("ActivityID")
);

-- CreateTable
CREATE TABLE "fraud_reports" (
    "ReportID" BIGSERIAL NOT NULL,
    "ReportedByUserID" BIGINT NOT NULL,
    "TargetEntityType" VARCHAR(20) NOT NULL,
    "TargetEntityID" BIGINT NOT NULL,
    "ReportReason" VARCHAR(50) NOT NULL,
    "Description" VARCHAR(2000),
    "EvidenceURLs" TEXT,
    "Status" VARCHAR(20) NOT NULL DEFAULT 'Open',
    "ReviewedBy" BIGINT,
    "Resolution" VARCHAR(1000),
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fraud_reports_pkey" PRIMARY KEY ("ReportID")
);

-- CreateTable
CREATE TABLE "fraud_blacklist" (
    "BlacklistID" BIGSERIAL NOT NULL,
    "EntityType" VARCHAR(20) NOT NULL,
    "EntityValue" VARCHAR(500) NOT NULL,
    "Reason" VARCHAR(500) NOT NULL,
    "BlockedBy" BIGINT NOT NULL,
    "BlockedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ExpiryDate" TIMESTAMP(3),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "fraud_blacklist_pkey" PRIMARY KEY ("BlacklistID")
);

-- CreateTable
CREATE TABLE "anlyt_daily_snapshots" (
    "DailySnapshotID" BIGSERIAL NOT NULL,
    "SnapshotDate" DATE NOT NULL,
    "NewUsers" INTEGER NOT NULL DEFAULT 0,
    "NewListings" INTEGER NOT NULL DEFAULT 0,
    "PublishedListings" INTEGER NOT NULL DEFAULT 0,
    "TotalViews" INTEGER NOT NULL DEFAULT 0,
    "TotalInquiries" INTEGER NOT NULL DEFAULT 0,
    "Revenue" DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    "NewSubscriptions" INTEGER NOT NULL DEFAULT 0,
    "ActiveBoosts" INTEGER NOT NULL DEFAULT 0,
    "TransactionsCount" INTEGER NOT NULL DEFAULT 0,
    "TopCategoryID" INTEGER,
    "TopCityID" INTEGER,
    "CalculatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anlyt_daily_snapshots_pkey" PRIMARY KEY ("DailySnapshotID")
);

-- CreateTable
CREATE TABLE "anlyt_listing_views" (
    "ViewID" BIGSERIAL NOT NULL,
    "ListingID" BIGINT NOT NULL,
    "UserID" BIGINT,
    "IPAddress" VARCHAR(45),
    "UserAgent" VARCHAR(500),
    "ReferrerURL" VARCHAR(2000),
    "ViewedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anlyt_listing_views_pkey" PRIMARY KEY ("ViewID")
);

-- CreateIndex
CREATE UNIQUE INDEX "geo_countries_CountryName_key" ON "geo_countries"("CountryName");

-- CreateIndex
CREATE UNIQUE INDEX "geo_countries_CountryCode_key" ON "geo_countries"("CountryCode");

-- CreateIndex
CREATE UNIQUE INDEX "geo_countries_RowGUID_key" ON "geo_countries"("RowGUID");

-- CreateIndex
CREATE INDEX "geo_countries_IsDeleted_idx" ON "geo_countries"("IsDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "geo_states_RowGUID_key" ON "geo_states"("RowGUID");

-- CreateIndex
CREATE INDEX "geo_states_CountryID_idx" ON "geo_states"("CountryID");

-- CreateIndex
CREATE INDEX "geo_states_IsDeleted_idx" ON "geo_states"("IsDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "geo_states_CountryID_StateName_key" ON "geo_states"("CountryID", "StateName");

-- CreateIndex
CREATE UNIQUE INDEX "geo_districts_RowGUID_key" ON "geo_districts"("RowGUID");

-- CreateIndex
CREATE INDEX "geo_districts_IsDeleted_idx" ON "geo_districts"("IsDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "geo_districts_StateID_DistrictName_key" ON "geo_districts"("StateID", "DistrictName");

-- CreateIndex
CREATE UNIQUE INDEX "geo_cities_RowGUID_key" ON "geo_cities"("RowGUID");

-- CreateIndex
CREATE INDEX "geo_cities_Latitude_Longitude_idx" ON "geo_cities"("Latitude", "Longitude");

-- CreateIndex
CREATE INDEX "geo_cities_IsDeleted_idx" ON "geo_cities"("IsDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "geo_cities_DistrictID_CityName_key" ON "geo_cities"("DistrictID", "CityName");

-- CreateIndex
CREATE UNIQUE INDEX "geo_areas_RowGUID_key" ON "geo_areas"("RowGUID");

-- CreateIndex
CREATE INDEX "geo_areas_IsDeleted_idx" ON "geo_areas"("IsDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "geo_localities_RowGUID_key" ON "geo_localities"("RowGUID");

-- CreateIndex
CREATE INDEX "geo_localities_IsDeleted_idx" ON "geo_localities"("IsDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "auth_users_UserGUID_key" ON "auth_users"("UserGUID");

-- CreateIndex
CREATE UNIQUE INDEX "auth_users_Email_key" ON "auth_users"("Email");

-- CreateIndex
CREATE INDEX "auth_users_IsActive_idx" ON "auth_users"("IsActive");

-- CreateIndex
CREATE INDEX "auth_users_IsDeleted_idx" ON "auth_users"("IsDeleted");

-- CreateIndex
CREATE INDEX "auth_users_Email_IsActive_idx" ON "auth_users"("Email", "IsActive");

-- CreateIndex
CREATE UNIQUE INDEX "auth_user_profiles_UserID_key" ON "auth_user_profiles"("UserID");

-- CreateIndex
CREATE UNIQUE INDEX "auth_user_profiles_PhoneNumber_key" ON "auth_user_profiles"("PhoneNumber");

-- CreateIndex
CREATE INDEX "auth_user_profiles_IsDeleted_idx" ON "auth_user_profiles"("IsDeleted");

-- CreateIndex
CREATE INDEX "auth_user_password_history_UserID_CreatedDate_idx" ON "auth_user_password_history"("UserID", "CreatedDate" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "auth_refresh_tokens_TokenHash_key" ON "auth_refresh_tokens"("TokenHash");

-- CreateIndex
CREATE INDEX "auth_refresh_tokens_TokenHash_idx" ON "auth_refresh_tokens"("TokenHash");

-- CreateIndex
CREATE INDEX "auth_refresh_tokens_UserID_idx" ON "auth_refresh_tokens"("UserID");

-- CreateIndex
CREATE UNIQUE INDEX "auth_user_devices_DeviceGUID_key" ON "auth_user_devices"("DeviceGUID");

-- CreateIndex
CREATE INDEX "auth_user_devices_UserID_idx" ON "auth_user_devices"("UserID");

-- CreateIndex
CREATE INDEX "auth_login_history_UserID_LoginDate_idx" ON "auth_login_history"("UserID", "LoginDate" DESC);

-- CreateIndex
CREATE INDEX "auth_login_history_LoginEmail_LoginDate_idx" ON "auth_login_history"("LoginEmail", "LoginDate" DESC);

-- CreateIndex
CREATE INDEX "auth_login_history_LoginStatus_LoginDate_idx" ON "auth_login_history"("LoginStatus", "LoginDate" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "auth_user_otp_OTPHash_key" ON "auth_user_otp"("OTPHash");

-- CreateIndex
CREATE INDEX "auth_user_otp_OTPHash_idx" ON "auth_user_otp"("OTPHash");

-- CreateIndex
CREATE INDEX "auth_user_otp_UserID_Purpose_IsValidated_idx" ON "auth_user_otp"("UserID", "Purpose", "IsValidated");

-- CreateIndex
CREATE INDEX "auth_account_locks_UserID_idx" ON "auth_account_locks"("UserID");

-- CreateIndex
CREATE INDEX "auth_two_factor_methods_UserID_idx" ON "auth_two_factor_methods"("UserID");

-- CreateIndex
CREATE UNIQUE INDEX "rbac_permission_categories_CategoryName_key" ON "rbac_permission_categories"("CategoryName");

-- CreateIndex
CREATE UNIQUE INDEX "rbac_permission_categories_CategoryCode_key" ON "rbac_permission_categories"("CategoryCode");

-- CreateIndex
CREATE UNIQUE INDEX "rbac_permissions_PermissionName_key" ON "rbac_permissions"("PermissionName");

-- CreateIndex
CREATE UNIQUE INDEX "rbac_permissions_Code_key" ON "rbac_permissions"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "rbac_roles_RoleName_key" ON "rbac_roles"("RoleName");

-- CreateIndex
CREATE UNIQUE INDEX "rbac_roles_RoleCode_key" ON "rbac_roles"("RoleCode");

-- CreateIndex
CREATE UNIQUE INDEX "rbac_roles_RowGUID_key" ON "rbac_roles"("RowGUID");

-- CreateIndex
CREATE UNIQUE INDEX "rbac_role_permissions_RoleID_PermissionID_key" ON "rbac_role_permissions"("RoleID", "PermissionID");

-- CreateIndex
CREATE UNIQUE INDEX "rbac_user_roles_UserID_RoleID_key" ON "rbac_user_roles"("UserID", "RoleID");

-- CreateIndex
CREATE UNIQUE INDEX "rbac_user_permission_overrides_UserID_PermissionID_key" ON "rbac_user_permission_overrides"("UserID", "PermissionID");

-- CreateIndex
CREATE INDEX "rbac_permission_audit_ChangedDate_idx" ON "rbac_permission_audit"("ChangedDate");

-- CreateIndex
CREATE UNIQUE INDEX "org_organizations_OrganizationGUID_key" ON "org_organizations"("OrganizationGUID");

-- CreateIndex
CREATE INDEX "org_organizations_VerificationStatus_idx" ON "org_organizations"("VerificationStatus");

-- CreateIndex
CREATE INDEX "org_organizations_IsDeleted_idx" ON "org_organizations"("IsDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "org_organizations_CompanyName_key" ON "org_organizations"("CompanyName");

-- CreateIndex
CREATE UNIQUE INDEX "org_organization_members_OrganizationID_UserID_key" ON "org_organization_members"("OrganizationID", "UserID");

-- CreateIndex
CREATE INDEX "verif_user_verifications_UserID_VerificationType_idx" ON "verif_user_verifications"("UserID", "VerificationType");

-- CreateIndex
CREATE INDEX "verif_user_verifications_Status_idx" ON "verif_user_verifications"("Status");

-- CreateIndex
CREATE INDEX "verif_verification_history_ChangedDate_idx" ON "verif_verification_history"("ChangedDate");

-- CreateIndex
CREATE UNIQUE INDEX "mast_master_groups_GroupCode_key" ON "mast_master_groups"("GroupCode");

-- CreateIndex
CREATE UNIQUE INDEX "mast_master_items_ItemCode_key" ON "mast_master_items"("ItemCode");

-- CreateIndex
CREATE INDEX "mast_master_items_IsDeleted_idx" ON "mast_master_items"("IsDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "mast_master_items_MasterGroupID_ItemCode_key" ON "mast_master_items"("MasterGroupID", "ItemCode");

-- CreateIndex
CREATE UNIQUE INDEX "list_categories_CategoryName_key" ON "list_categories"("CategoryName");

-- CreateIndex
CREATE UNIQUE INDEX "list_categories_Slug_key" ON "list_categories"("Slug");

-- CreateIndex
CREATE UNIQUE INDEX "list_listings_ListingGUID_key" ON "list_listings"("ListingGUID");

-- CreateIndex
CREATE UNIQUE INDEX "list_listings_Slug_key" ON "list_listings"("Slug");

-- CreateIndex
CREATE INDEX "list_listings_UserID_Status_idx" ON "list_listings"("UserID", "Status");

-- CreateIndex
CREATE INDEX "list_listings_CategoryID_Status_idx" ON "list_listings"("CategoryID", "Status");

-- CreateIndex
CREATE INDEX "list_listings_LocalityID_Price_idx" ON "list_listings"("LocalityID", "Price");

-- CreateIndex
CREATE INDEX "list_listings_Status_idx" ON "list_listings"("Status");

-- CreateIndex
CREATE INDEX "list_listings_IsFeatured_idx" ON "list_listings"("IsFeatured");

-- CreateIndex
CREATE INDEX "list_listings_CreatedDate_idx" ON "list_listings"("CreatedDate");

-- CreateIndex
CREATE INDEX "list_listings_Latitude_Longitude_idx" ON "list_listings"("Latitude", "Longitude");

-- CreateIndex
CREATE UNIQUE INDEX "list_listing_features_ListingID_MasterItemID_key" ON "list_listing_features"("ListingID", "MasterItemID");

-- CreateIndex
CREATE UNIQUE INDEX "list_listing_nearby_places_ListingID_PlaceTypeID_PlaceName_key" ON "list_listing_nearby_places"("ListingID", "PlaceTypeID", "PlaceName");

-- CreateIndex
CREATE UNIQUE INDEX "list_listing_restrictions_ListingID_RestrictionTypeID_key" ON "list_listing_restrictions"("ListingID", "RestrictionTypeID");

-- CreateIndex
CREATE INDEX "media_assets_ListingID_DisplayOrder_idx" ON "media_assets"("ListingID", "DisplayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "wflow_statuses_StatusCode_EntityType_key" ON "wflow_statuses"("StatusCode", "EntityType");

-- CreateIndex
CREATE UNIQUE INDEX "wflow_transitions_EntityType_FromStatusID_ToStatusID_key" ON "wflow_transitions"("EntityType", "FromStatusID", "ToStatusID");

-- CreateIndex
CREATE INDEX "wflow_workflow_history_EntityType_EntityID_TransitionDate_idx" ON "wflow_workflow_history"("EntityType", "EntityID", "TransitionDate" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "sub_plans_PlanCode_key" ON "sub_plans"("PlanCode");

-- CreateIndex
CREATE UNIQUE INDEX "sub_plan_features_PlanID_FeatureID_key" ON "sub_plan_features"("PlanID", "FeatureID");

-- CreateIndex
CREATE INDEX "sub_user_subscriptions_UserID_Status_idx" ON "sub_user_subscriptions"("UserID", "Status");

-- CreateIndex
CREATE INDEX "sub_user_subscriptions_EndDate_idx" ON "sub_user_subscriptions"("EndDate");

-- CreateIndex
CREATE INDEX "sub_listing_boosts_ListingID_IsActive_idx" ON "sub_listing_boosts"("ListingID", "IsActive");

-- CreateIndex
CREATE INDEX "sub_listing_boosts_EndDate_idx" ON "sub_listing_boosts"("EndDate");

-- CreateIndex
CREATE UNIQUE INDEX "pay_payment_gateways_GatewayName_key" ON "pay_payment_gateways"("GatewayName");

-- CreateIndex
CREATE UNIQUE INDEX "pay_payment_gateways_GatewayCode_key" ON "pay_payment_gateways"("GatewayCode");

-- CreateIndex
CREATE UNIQUE INDEX "pay_transactions_TransactionGUID_key" ON "pay_transactions"("TransactionGUID");

-- CreateIndex
CREATE INDEX "pay_transactions_UserID_TransactionDate_idx" ON "pay_transactions"("UserID", "TransactionDate" DESC);

-- CreateIndex
CREATE INDEX "pay_transactions_EntityType_EntityID_idx" ON "pay_transactions"("EntityType", "EntityID");

-- CreateIndex
CREATE INDEX "pay_transactions_Status_idx" ON "pay_transactions"("Status");

-- CreateIndex
CREATE INDEX "pay_transactions_GatewayTransactionID_idx" ON "pay_transactions"("GatewayTransactionID");

-- CreateIndex
CREATE UNIQUE INDEX "pay_invoices_InvoiceNumber_key" ON "pay_invoices"("InvoiceNumber");

-- CreateIndex
CREATE INDEX "ad_banners_IsActive_idx" ON "ad_banners"("IsActive");

-- CreateIndex
CREATE UNIQUE INDEX "ad_analytics_BannerID_EventDate_key" ON "ad_analytics"("BannerID", "EventDate");

-- CreateIndex
CREATE UNIQUE INDEX "serv_service_categories_CategoryCode_key" ON "serv_service_categories"("CategoryCode");

-- CreateIndex
CREATE UNIQUE INDEX "serv_services_ServiceCode_key" ON "serv_services"("ServiceCode");

-- CreateIndex
CREATE INDEX "serv_service_requests_Status_idx" ON "serv_service_requests"("Status");

-- CreateIndex
CREATE UNIQUE INDEX "chat_conversations_ConversationGUID_key" ON "chat_conversations"("ConversationGUID");

-- CreateIndex
CREATE INDEX "chat_conversations_SubjectEntityType_SubjectEntityID_idx" ON "chat_conversations"("SubjectEntityType", "SubjectEntityID");

-- CreateIndex
CREATE UNIQUE INDEX "chat_conversation_participants_ConversationID_UserID_key" ON "chat_conversation_participants"("ConversationID", "UserID");

-- CreateIndex
CREATE INDEX "chat_messages_ConversationID_SentDate_idx" ON "chat_messages"("ConversationID", "SentDate");

-- CreateIndex
CREATE UNIQUE INDEX "notify_templates_TemplateCode_key" ON "notify_templates"("TemplateCode");

-- CreateIndex
CREATE INDEX "notify_queue_Status_CreatedDate_idx" ON "notify_queue"("Status", "CreatedDate");

-- CreateIndex
CREATE UNIQUE INDEX "notify_preferences_UserID_NotificationType_Channel_key" ON "notify_preferences"("UserID", "NotificationType", "Channel");

-- CreateIndex
CREATE UNIQUE INDEX "wish_wishlist_UserID_ListingID_key" ON "wish_wishlist"("UserID", "ListingID");

-- CreateIndex
CREATE INDEX "wish_recently_viewed_UserID_ViewedDate_idx" ON "wish_recently_viewed"("UserID", "ViewedDate" DESC);

-- CreateIndex
CREATE INDEX "review_reviews_ReviewedEntityType_ReviewedEntityID_idx" ON "review_reviews"("ReviewedEntityType", "ReviewedEntityID");

-- CreateIndex
CREATE INDEX "audit_entity_changes_EntityType_EntityID_ChangedDate_idx" ON "audit_entity_changes"("EntityType", "EntityID", "ChangedDate" DESC);

-- CreateIndex
CREATE INDEX "actv_activity_log_UserID_CreatedDate_idx" ON "actv_activity_log"("UserID", "CreatedDate" DESC);

-- CreateIndex
CREATE INDEX "actv_activity_log_ActivityType_CreatedDate_idx" ON "actv_activity_log"("ActivityType", "CreatedDate" DESC);

-- CreateIndex
CREATE INDEX "fraud_reports_TargetEntityType_TargetEntityID_Status_idx" ON "fraud_reports"("TargetEntityType", "TargetEntityID", "Status");

-- CreateIndex
CREATE INDEX "fraud_blacklist_IsActive_idx" ON "fraud_blacklist"("IsActive");

-- CreateIndex
CREATE UNIQUE INDEX "fraud_blacklist_EntityType_EntityValue_key" ON "fraud_blacklist"("EntityType", "EntityValue");

-- CreateIndex
CREATE UNIQUE INDEX "anlyt_daily_snapshots_SnapshotDate_key" ON "anlyt_daily_snapshots"("SnapshotDate");

-- CreateIndex
CREATE INDEX "anlyt_listing_views_ListingID_ViewedDate_idx" ON "anlyt_listing_views"("ListingID", "ViewedDate");

-- CreateIndex
CREATE INDEX "anlyt_listing_views_ViewedDate_idx" ON "anlyt_listing_views"("ViewedDate");

-- AddForeignKey
ALTER TABLE "geo_states" ADD CONSTRAINT "geo_states_CountryID_fkey" FOREIGN KEY ("CountryID") REFERENCES "geo_countries"("CountryID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geo_districts" ADD CONSTRAINT "geo_districts_StateID_fkey" FOREIGN KEY ("StateID") REFERENCES "geo_states"("StateID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geo_cities" ADD CONSTRAINT "geo_cities_DistrictID_fkey" FOREIGN KEY ("DistrictID") REFERENCES "geo_districts"("DistrictID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geo_areas" ADD CONSTRAINT "geo_areas_CityID_fkey" FOREIGN KEY ("CityID") REFERENCES "geo_cities"("CityID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geo_localities" ADD CONSTRAINT "geo_localities_AreaID_fkey" FOREIGN KEY ("AreaID") REFERENCES "geo_areas"("AreaID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_user_profiles" ADD CONSTRAINT "auth_user_profiles_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "auth_users"("UserID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_user_password_history" ADD CONSTRAINT "auth_user_password_history_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "auth_users"("UserID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_refresh_tokens" ADD CONSTRAINT "auth_refresh_tokens_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "auth_users"("UserID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_refresh_tokens" ADD CONSTRAINT "auth_refresh_tokens_DeviceID_fkey" FOREIGN KEY ("DeviceID") REFERENCES "auth_user_devices"("DeviceID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_user_devices" ADD CONSTRAINT "auth_user_devices_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "auth_users"("UserID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_login_history" ADD CONSTRAINT "auth_login_history_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "auth_users"("UserID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_login_history" ADD CONSTRAINT "auth_login_history_DeviceID_fkey" FOREIGN KEY ("DeviceID") REFERENCES "auth_user_devices"("DeviceID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_user_otp" ADD CONSTRAINT "auth_user_otp_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "auth_users"("UserID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_account_locks" ADD CONSTRAINT "auth_account_locks_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "auth_users"("UserID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_account_locks" ADD CONSTRAINT "auth_account_locks_UnlockedBy_fkey" FOREIGN KEY ("UnlockedBy") REFERENCES "auth_users"("UserID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_two_factor_methods" ADD CONSTRAINT "auth_two_factor_methods_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "auth_users"("UserID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rbac_permissions" ADD CONSTRAINT "rbac_permissions_PermissionCategoryID_fkey" FOREIGN KEY ("PermissionCategoryID") REFERENCES "rbac_permission_categories"("PermissionCategoryID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rbac_role_permissions" ADD CONSTRAINT "rbac_role_permissions_RoleID_fkey" FOREIGN KEY ("RoleID") REFERENCES "rbac_roles"("RoleID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rbac_role_permissions" ADD CONSTRAINT "rbac_role_permissions_PermissionID_fkey" FOREIGN KEY ("PermissionID") REFERENCES "rbac_permissions"("PermissionID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rbac_user_roles" ADD CONSTRAINT "rbac_user_roles_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "auth_users"("UserID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rbac_user_roles" ADD CONSTRAINT "rbac_user_roles_RoleID_fkey" FOREIGN KEY ("RoleID") REFERENCES "rbac_roles"("RoleID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rbac_user_roles" ADD CONSTRAINT "rbac_user_roles_AssignedBy_fkey" FOREIGN KEY ("AssignedBy") REFERENCES "auth_users"("UserID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rbac_user_permission_overrides" ADD CONSTRAINT "rbac_user_permission_overrides_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "auth_users"("UserID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rbac_user_permission_overrides" ADD CONSTRAINT "rbac_user_permission_overrides_PermissionID_fkey" FOREIGN KEY ("PermissionID") REFERENCES "rbac_permissions"("PermissionID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rbac_user_permission_overrides" ADD CONSTRAINT "rbac_user_permission_overrides_AssignedBy_fkey" FOREIGN KEY ("AssignedBy") REFERENCES "auth_users"("UserID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rbac_permission_audit" ADD CONSTRAINT "rbac_permission_audit_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "auth_users"("UserID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rbac_permission_audit" ADD CONSTRAINT "rbac_permission_audit_ChangedBy_fkey" FOREIGN KEY ("ChangedBy") REFERENCES "auth_users"("UserID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_organizations" ADD CONSTRAINT "org_organizations_PrimaryContactUserID_fkey" FOREIGN KEY ("PrimaryContactUserID") REFERENCES "auth_users"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_organizations" ADD CONSTRAINT "org_organizations_VerifiedBy_fkey" FOREIGN KEY ("VerifiedBy") REFERENCES "auth_users"("UserID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_organizations" ADD CONSTRAINT "org_organizations_CreatedBy_fkey" FOREIGN KEY ("CreatedBy") REFERENCES "auth_users"("UserID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_organizations" ADD CONSTRAINT "org_organizations_ModifiedBy_fkey" FOREIGN KEY ("ModifiedBy") REFERENCES "auth_users"("UserID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_organizations" ADD CONSTRAINT "org_organizations_DeletedBy_fkey" FOREIGN KEY ("DeletedBy") REFERENCES "auth_users"("UserID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_organization_members" ADD CONSTRAINT "org_organization_members_OrganizationID_fkey" FOREIGN KEY ("OrganizationID") REFERENCES "org_organizations"("OrganizationID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_organization_members" ADD CONSTRAINT "org_organization_members_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "auth_users"("UserID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_organization_documents" ADD CONSTRAINT "org_organization_documents_OrganizationID_fkey" FOREIGN KEY ("OrganizationID") REFERENCES "org_organizations"("OrganizationID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verif_user_verifications" ADD CONSTRAINT "verif_user_verifications_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "auth_users"("UserID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verif_user_verifications" ADD CONSTRAINT "verif_user_verifications_ReviewerUserID_fkey" FOREIGN KEY ("ReviewerUserID") REFERENCES "auth_users"("UserID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verif_verification_documents" ADD CONSTRAINT "verif_verification_documents_VerificationID_fkey" FOREIGN KEY ("VerificationID") REFERENCES "verif_user_verifications"("VerificationID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verif_verification_history" ADD CONSTRAINT "verif_verification_history_VerificationID_fkey" FOREIGN KEY ("VerificationID") REFERENCES "verif_user_verifications"("VerificationID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verif_verification_history" ADD CONSTRAINT "verif_verification_history_ChangedBy_fkey" FOREIGN KEY ("ChangedBy") REFERENCES "auth_users"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mast_master_items" ADD CONSTRAINT "mast_master_items_MasterGroupID_fkey" FOREIGN KEY ("MasterGroupID") REFERENCES "mast_master_groups"("MasterGroupID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_categories" ADD CONSTRAINT "list_categories_ParentCategoryID_fkey" FOREIGN KEY ("ParentCategoryID") REFERENCES "list_categories"("CategoryID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_listings" ADD CONSTRAINT "list_listings_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "auth_users"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_listings" ADD CONSTRAINT "list_listings_CreatedBy_fkey" FOREIGN KEY ("CreatedBy") REFERENCES "auth_users"("UserID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_listings" ADD CONSTRAINT "list_listings_ModifiedBy_fkey" FOREIGN KEY ("ModifiedBy") REFERENCES "auth_users"("UserID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_listings" ADD CONSTRAINT "list_listings_DeletedBy_fkey" FOREIGN KEY ("DeletedBy") REFERENCES "auth_users"("UserID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_listings" ADD CONSTRAINT "list_listings_OrganizationID_fkey" FOREIGN KEY ("OrganizationID") REFERENCES "org_organizations"("OrganizationID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_listings" ADD CONSTRAINT "list_listings_CategoryID_fkey" FOREIGN KEY ("CategoryID") REFERENCES "list_categories"("CategoryID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_listings" ADD CONSTRAINT "list_listings_LocalityID_fkey" FOREIGN KEY ("LocalityID") REFERENCES "geo_localities"("LocalityID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_listings" ADD CONSTRAINT "list_listings_AreaUnitID_fkey" FOREIGN KEY ("AreaUnitID") REFERENCES "mast_master_items"("MasterItemID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_listings" ADD CONSTRAINT "list_listings_PropertyConditionID_fkey" FOREIGN KEY ("PropertyConditionID") REFERENCES "mast_master_items"("MasterItemID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_listings" ADD CONSTRAINT "list_listings_OwnershipTypeID_fkey" FOREIGN KEY ("OwnershipTypeID") REFERENCES "mast_master_items"("MasterItemID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_listing_features" ADD CONSTRAINT "list_listing_features_ListingID_fkey" FOREIGN KEY ("ListingID") REFERENCES "list_listings"("ListingID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_listing_features" ADD CONSTRAINT "list_listing_features_MasterItemID_fkey" FOREIGN KEY ("MasterItemID") REFERENCES "mast_master_items"("MasterItemID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_listing_nearby_places" ADD CONSTRAINT "list_listing_nearby_places_ListingID_fkey" FOREIGN KEY ("ListingID") REFERENCES "list_listings"("ListingID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_listing_nearby_places" ADD CONSTRAINT "list_listing_nearby_places_PlaceTypeID_fkey" FOREIGN KEY ("PlaceTypeID") REFERENCES "mast_master_items"("MasterItemID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_listing_restrictions" ADD CONSTRAINT "list_listing_restrictions_ListingID_fkey" FOREIGN KEY ("ListingID") REFERENCES "list_listings"("ListingID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_listing_restrictions" ADD CONSTRAINT "list_listing_restrictions_RestrictionTypeID_fkey" FOREIGN KEY ("RestrictionTypeID") REFERENCES "mast_master_items"("MasterItemID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_ListingID_fkey" FOREIGN KEY ("ListingID") REFERENCES "list_listings"("ListingID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wflow_transitions" ADD CONSTRAINT "wflow_transitions_FromStatusID_fkey" FOREIGN KEY ("FromStatusID") REFERENCES "wflow_statuses"("StatusID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wflow_transitions" ADD CONSTRAINT "wflow_transitions_ToStatusID_fkey" FOREIGN KEY ("ToStatusID") REFERENCES "wflow_statuses"("StatusID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wflow_transitions" ADD CONSTRAINT "wflow_transitions_RequiredPermissionID_fkey" FOREIGN KEY ("RequiredPermissionID") REFERENCES "rbac_permissions"("PermissionID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wflow_workflow_history" ADD CONSTRAINT "wflow_workflow_history_FromStatusID_fkey" FOREIGN KEY ("FromStatusID") REFERENCES "wflow_statuses"("StatusID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wflow_workflow_history" ADD CONSTRAINT "wflow_workflow_history_ToStatusID_fkey" FOREIGN KEY ("ToStatusID") REFERENCES "wflow_statuses"("StatusID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wflow_workflow_history" ADD CONSTRAINT "wflow_workflow_history_ActionBy_fkey" FOREIGN KEY ("ActionBy") REFERENCES "auth_users"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_plan_features" ADD CONSTRAINT "sub_plan_features_PlanID_fkey" FOREIGN KEY ("PlanID") REFERENCES "sub_plans"("PlanID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_plan_features" ADD CONSTRAINT "sub_plan_features_FeatureID_fkey" FOREIGN KEY ("FeatureID") REFERENCES "mast_master_items"("MasterItemID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_user_subscriptions" ADD CONSTRAINT "sub_user_subscriptions_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "auth_users"("UserID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_user_subscriptions" ADD CONSTRAINT "sub_user_subscriptions_PlanID_fkey" FOREIGN KEY ("PlanID") REFERENCES "sub_plans"("PlanID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_user_subscriptions" ADD CONSTRAINT "sub_user_subscriptions_PaymentTransactionID_fkey" FOREIGN KEY ("PaymentTransactionID") REFERENCES "pay_transactions"("TransactionID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_listing_boosts" ADD CONSTRAINT "sub_listing_boosts_ListingID_fkey" FOREIGN KEY ("ListingID") REFERENCES "list_listings"("ListingID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_listing_boosts" ADD CONSTRAINT "sub_listing_boosts_SubscriptionID_fkey" FOREIGN KEY ("SubscriptionID") REFERENCES "sub_user_subscriptions"("SubscriptionID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pay_transactions" ADD CONSTRAINT "pay_transactions_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "auth_users"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pay_transactions" ADD CONSTRAINT "pay_transactions_GatewayID_fkey" FOREIGN KEY ("GatewayID") REFERENCES "pay_payment_gateways"("GatewayID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pay_invoices" ADD CONSTRAINT "pay_invoices_TransactionID_fkey" FOREIGN KEY ("TransactionID") REFERENCES "pay_transactions"("TransactionID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pay_invoices" ADD CONSTRAINT "pay_invoices_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "auth_users"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pay_refunds" ADD CONSTRAINT "pay_refunds_TransactionID_fkey" FOREIGN KEY ("TransactionID") REFERENCES "pay_transactions"("TransactionID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pay_refunds" ADD CONSTRAINT "pay_refunds_CreatedBy_fkey" FOREIGN KEY ("CreatedBy") REFERENCES "auth_users"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_campaigns" ADD CONSTRAINT "ad_campaigns_AdvertiserID_fkey" FOREIGN KEY ("AdvertiserID") REFERENCES "org_organizations"("OrganizationID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_banners" ADD CONSTRAINT "ad_banners_CampaignID_fkey" FOREIGN KEY ("CampaignID") REFERENCES "ad_campaigns"("CampaignID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_analytics" ADD CONSTRAINT "ad_analytics_BannerID_fkey" FOREIGN KEY ("BannerID") REFERENCES "ad_banners"("BannerID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serv_services" ADD CONSTRAINT "serv_services_ServiceCategoryID_fkey" FOREIGN KEY ("ServiceCategoryID") REFERENCES "serv_service_categories"("ServiceCategoryID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serv_service_requests" ADD CONSTRAINT "serv_service_requests_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "auth_users"("UserID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serv_service_requests" ADD CONSTRAINT "serv_service_requests_AssignedTo_fkey" FOREIGN KEY ("AssignedTo") REFERENCES "auth_users"("UserID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serv_service_requests" ADD CONSTRAINT "serv_service_requests_ServiceID_fkey" FOREIGN KEY ("ServiceID") REFERENCES "serv_services"("ServiceID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serv_service_requests" ADD CONSTRAINT "serv_service_requests_ListingID_fkey" FOREIGN KEY ("ListingID") REFERENCES "list_listings"("ListingID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serv_service_requests" ADD CONSTRAINT "serv_service_requests_TransactionID_fkey" FOREIGN KEY ("TransactionID") REFERENCES "pay_transactions"("TransactionID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_InitiatedBy_fkey" FOREIGN KEY ("InitiatedBy") REFERENCES "auth_users"("UserID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_conversation_participants" ADD CONSTRAINT "chat_conversation_participants_ConversationID_fkey" FOREIGN KEY ("ConversationID") REFERENCES "chat_conversations"("ConversationID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_conversation_participants" ADD CONSTRAINT "chat_conversation_participants_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "auth_users"("UserID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_ConversationID_fkey" FOREIGN KEY ("ConversationID") REFERENCES "chat_conversations"("ConversationID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_SenderUserID_fkey" FOREIGN KEY ("SenderUserID") REFERENCES "auth_users"("UserID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notify_queue" ADD CONSTRAINT "notify_queue_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "auth_users"("UserID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notify_queue" ADD CONSTRAINT "notify_queue_TemplateID_fkey" FOREIGN KEY ("TemplateID") REFERENCES "notify_templates"("TemplateID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notify_preferences" ADD CONSTRAINT "notify_preferences_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "auth_users"("UserID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wish_wishlist" ADD CONSTRAINT "wish_wishlist_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "auth_users"("UserID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wish_wishlist" ADD CONSTRAINT "wish_wishlist_ListingID_fkey" FOREIGN KEY ("ListingID") REFERENCES "list_listings"("ListingID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wish_saved_searches" ADD CONSTRAINT "wish_saved_searches_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "auth_users"("UserID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wish_recently_viewed" ADD CONSTRAINT "wish_recently_viewed_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "auth_users"("UserID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wish_recently_viewed" ADD CONSTRAINT "wish_recently_viewed_ListingID_fkey" FOREIGN KEY ("ListingID") REFERENCES "list_listings"("ListingID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_reviews" ADD CONSTRAINT "review_reviews_ReviewedByUserID_fkey" FOREIGN KEY ("ReviewedByUserID") REFERENCES "auth_users"("UserID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_reviews" ADD CONSTRAINT "review_reviews_ListingID_fkey" FOREIGN KEY ("ListingID") REFERENCES "list_listings"("ListingID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_entity_changes" ADD CONSTRAINT "audit_entity_changes_ChangedBy_fkey" FOREIGN KEY ("ChangedBy") REFERENCES "auth_users"("UserID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_field_changes" ADD CONSTRAINT "audit_field_changes_AuditID_fkey" FOREIGN KEY ("AuditID") REFERENCES "audit_entity_changes"("AuditID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actv_activity_log" ADD CONSTRAINT "actv_activity_log_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "auth_users"("UserID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actv_activity_log" ADD CONSTRAINT "actv_activity_log_DeviceID_fkey" FOREIGN KEY ("DeviceID") REFERENCES "auth_user_devices"("DeviceID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fraud_reports" ADD CONSTRAINT "fraud_reports_ReportedByUserID_fkey" FOREIGN KEY ("ReportedByUserID") REFERENCES "auth_users"("UserID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fraud_reports" ADD CONSTRAINT "fraud_reports_ReviewedBy_fkey" FOREIGN KEY ("ReviewedBy") REFERENCES "auth_users"("UserID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fraud_blacklist" ADD CONSTRAINT "fraud_blacklist_BlockedBy_fkey" FOREIGN KEY ("BlockedBy") REFERENCES "auth_users"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anlyt_listing_views" ADD CONSTRAINT "anlyt_listing_views_ListingID_fkey" FOREIGN KEY ("ListingID") REFERENCES "list_listings"("ListingID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anlyt_listing_views" ADD CONSTRAINT "anlyt_listing_views_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "auth_users"("UserID") ON DELETE SET NULL ON UPDATE CASCADE;
