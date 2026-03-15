-- Convert modelsJson from TEXT to JSONB
-- Safe: all existing values are valid JSON arrays stored via JSON.stringify

ALTER TABLE "MonthlyRecord"
  ALTER COLUMN "modelsJson" TYPE JSONB USING "modelsJson"::jsonb,
  ALTER COLUMN "modelsJson" DROP NOT NULL,
  ALTER COLUMN "modelsJson" DROP DEFAULT;
