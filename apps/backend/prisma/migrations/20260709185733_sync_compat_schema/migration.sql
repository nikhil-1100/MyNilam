/*
  Warnings:

  - You are about to drop the column `Notes` on the `wish_wishlist` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "wish_wishlist" DROP COLUMN "Notes";

-- CreateTable
CREATE TABLE "list_inquiries" (
    "InquiryID" BIGSERIAL NOT NULL,
    "UserID" BIGINT NOT NULL,
    "ListingID" BIGINT NOT NULL,
    "Message" TEXT NOT NULL,
    "Status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "Response" TEXT,
    "RespondedBy" BIGINT,
    "RespondedAt" TIMESTAMP(3),
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ModifiedDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "list_inquiries_pkey" PRIMARY KEY ("InquiryID")
);

-- CreateTable
CREATE TABLE "list_visits" (
    "VisitID" BIGSERIAL NOT NULL,
    "UserID" BIGINT NOT NULL,
    "ListingID" BIGINT NOT NULL,
    "ScheduledAt" TIMESTAMP(3) NOT NULL,
    "Status" VARCHAR(20) NOT NULL DEFAULT 'REQUESTED',
    "Notes" TEXT,
    "OwnerNotes" TEXT,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ModifiedDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "list_visits_pkey" PRIMARY KEY ("VisitID")
);

-- CreateTable
CREATE TABLE "notify_notifications" (
    "NotificationID" BIGSERIAL NOT NULL,
    "UserID" BIGINT NOT NULL,
    "Type" VARCHAR(50) NOT NULL,
    "Title" VARCHAR(200) NOT NULL,
    "Message" TEXT NOT NULL,
    "Read" BOOLEAN NOT NULL DEFAULT false,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notify_notifications_pkey" PRIMARY KEY ("NotificationID")
);

-- CreateTable
CREATE TABLE "wish_search_history" (
    "SearchHistoryID" BIGSERIAL NOT NULL,
    "UserID" BIGINT NOT NULL,
    "Query" VARCHAR(500) NOT NULL,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wish_search_history_pkey" PRIMARY KEY ("SearchHistoryID")
);

-- CreateIndex
CREATE INDEX "list_inquiries_ListingID_idx" ON "list_inquiries"("ListingID");

-- CreateIndex
CREATE INDEX "list_inquiries_UserID_idx" ON "list_inquiries"("UserID");

-- CreateIndex
CREATE INDEX "list_inquiries_Status_idx" ON "list_inquiries"("Status");

-- AddForeignKey
ALTER TABLE "list_inquiries" ADD CONSTRAINT "list_inquiries_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "auth_users"("UserID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_inquiries" ADD CONSTRAINT "list_inquiries_RespondedBy_fkey" FOREIGN KEY ("RespondedBy") REFERENCES "auth_users"("UserID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_inquiries" ADD CONSTRAINT "list_inquiries_ListingID_fkey" FOREIGN KEY ("ListingID") REFERENCES "list_listings"("ListingID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_visits" ADD CONSTRAINT "list_visits_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "auth_users"("UserID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_visits" ADD CONSTRAINT "list_visits_ListingID_fkey" FOREIGN KEY ("ListingID") REFERENCES "list_listings"("ListingID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notify_notifications" ADD CONSTRAINT "notify_notifications_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "auth_users"("UserID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wish_search_history" ADD CONSTRAINT "wish_search_history_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "auth_users"("UserID") ON DELETE CASCADE ON UPDATE CASCADE;
