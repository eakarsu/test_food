CREATE TABLE "runtime_ai_results" (
  "id" TEXT NOT NULL,
  "feature" TEXT NOT NULL,
  "prompt" JSONB NOT NULL,
  "response" JSONB NOT NULL,
  "providerId" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT NOT NULL,
  CONSTRAINT "runtime_ai_results_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "runtime_ai_results_userId_createdAt_idx" ON "runtime_ai_results"("userId", "createdAt");
ALTER TABLE "runtime_ai_results" ADD CONSTRAINT "runtime_ai_results_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
