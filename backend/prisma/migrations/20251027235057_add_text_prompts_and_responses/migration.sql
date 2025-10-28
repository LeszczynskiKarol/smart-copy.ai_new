-- AlterTable
ALTER TABLE "texts" ADD COLUMN     "queryPrompt" TEXT,
ADD COLUMN     "queryResponse" TEXT,
ADD COLUMN     "selectPrompt" TEXT,
ADD COLUMN     "selectResponse" TEXT,
ADD COLUMN     "structurePrompt" TEXT,
ADD COLUMN     "structureResponse" TEXT,
ADD COLUMN     "writerPrompts" TEXT,
ADD COLUMN     "writerResponses" TEXT;
