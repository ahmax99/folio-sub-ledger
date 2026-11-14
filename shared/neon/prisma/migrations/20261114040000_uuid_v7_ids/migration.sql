-- Postgres can't change the type of a column a policy uses, so the tenant policies are recreated around it.
DROP POLICY "tenant_isolation" ON "organizations";
DROP POLICY "tenant_isolation" ON "users";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_org_id_fkey";

-- AlterTable
ALTER TABLE "organizations" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "org_id" SET DATA TYPE UUID USING "org_id"::uuid;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE POLICY "tenant_isolation" ON "organizations"
  USING ("id" = NULLIF(current_setting('app.org_id', true), '')::uuid)
  WITH CHECK ("id" = NULLIF(current_setting('app.org_id', true), '')::uuid);

CREATE POLICY "tenant_isolation" ON "users"
  USING ("org_id" = NULLIF(current_setting('app.org_id', true), '')::uuid)
  WITH CHECK ("org_id" = NULLIF(current_setting('app.org_id', true), '')::uuid);
