-- CreateTable
CREATE TABLE "list_hostels" (
    "HostelID" BIGSERIAL NOT NULL,
    "PropertyID" BIGINT NOT NULL,
    "Name" VARCHAR(200) NOT NULL,
    "TotalBedSpaces" INTEGER NOT NULL,
    "TotalRooms" INTEGER NOT NULL,
    "BathroomCount" INTEGER NOT NULL,
    "AttachedBathrooms" BOOLEAN NOT NULL DEFAULT false,
    "GenderType" VARCHAR(50) NOT NULL DEFAULT 'UNISEX',
    "WifiEnabled" BOOLEAN NOT NULL DEFAULT false,
    "WifiSpeed" VARCHAR(100),
    "HotWater" BOOLEAN NOT NULL DEFAULT false,
    "WaterFilter" BOOLEAN NOT NULL DEFAULT false,
    "MessFood" BOOLEAN NOT NULL DEFAULT false,
    "LaundryEnabled" BOOLEAN NOT NULL DEFAULT false,
    "AcAvailable" BOOLEAN NOT NULL DEFAULT false,
    "WaterSource" VARCHAR(100),
    "VacantBeds" INTEGER NOT NULL DEFAULT 0,
    "VacantRooms" INTEGER NOT NULL DEFAULT 0,
    "VacantSharings" TEXT[],
    "AllowedSharings" TEXT[],
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ModifiedDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "list_hostels_pkey" PRIMARY KEY ("HostelID")
);

-- CreateTable
CREATE TABLE "list_hostel_pricing" (
    "PricingID" BIGSERIAL NOT NULL,
    "HostelID" BIGINT NOT NULL,
    "ShareType" VARCHAR(50) NOT NULL,
    "Price" INTEGER NOT NULL,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ModifiedDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "list_hostel_pricing_pkey" PRIMARY KEY ("PricingID")
);

-- CreateIndex
CREATE UNIQUE INDEX "list_hostels_PropertyID_key" ON "list_hostels"("PropertyID");

-- CreateIndex
CREATE UNIQUE INDEX "list_hostel_pricing_HostelID_ShareType_key" ON "list_hostel_pricing"("HostelID", "ShareType");

-- AddForeignKey
ALTER TABLE "list_hostels" ADD CONSTRAINT "list_hostels_PropertyID_fkey" FOREIGN KEY ("PropertyID") REFERENCES "list_listings"("ListingID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_hostel_pricing" ADD CONSTRAINT "list_hostel_pricing_HostelID_fkey" FOREIGN KEY ("HostelID") REFERENCES "list_hostels"("HostelID") ON DELETE CASCADE ON UPDATE CASCADE;
