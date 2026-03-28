-- CreateTable
CREATE TABLE "step_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "step_id" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "step_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "step_progress_user_id_step_id_key" ON "step_progress"("user_id", "step_id");

-- AddForeignKey
ALTER TABLE "step_progress" ADD CONSTRAINT "step_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "step_progress" ADD CONSTRAINT "step_progress_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "steps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
