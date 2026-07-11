-- AlterTable
ALTER TABLE "auth_users" ADD COLUMN     "AssignedHostelID" BIGINT;

-- AddForeignKey
ALTER TABLE "auth_users" ADD CONSTRAINT "auth_users_AssignedHostelID_fkey" FOREIGN KEY ("AssignedHostelID") REFERENCES "list_hostels"("HostelID") ON DELETE SET NULL ON UPDATE CASCADE;
