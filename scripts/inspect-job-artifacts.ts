import { PrismaClient, JobStage, ArtifactType } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function inspectJob(jobId: string) {
  console.log(`🔍 Inspecting Job: ${jobId}`);

  const artifacts = await prisma.artifact.findMany({
    where: { jobId },
    orderBy: { stage: 'asc' },
  });

  for (const artifact of artifacts) {
    console.log(`\n--- Stage: ${artifact.stage}, Type: ${artifact.type}, Version: ${artifact.version} ---`);
    if (artifact.type === ArtifactType.JSON) {
      const content = artifact.content as any;
      if (artifact.stage === JobStage.SCRIPT) {
        console.log(`Pages count in SCRIPT: ${content.pages?.length}`);
      } else if (artifact.stage === JobStage.STORYBOARD) {
        console.log(`Pages count in STORYBOARD: ${content.pages?.length}`);
      } else if (artifact.stage === JobStage.PAGES) {
          console.log(`HTML length: ${content.htmlContent?.length}`);
          if (content.pptResult) {
              console.log(`pptResult stats:`, content.pptResult.stats);
              console.log(`htmlPages count:`, content.pptResult.htmlPages?.length);
          }
      }
      // console.log(JSON.stringify(content, null, 2).substring(0, 1000));
    }
  }
}

const jobId = process.argv[2];
if (!jobId) {
  console.error('Please provide a jobId');
  process.exit(1);
}

inspectJob(jobId)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
