import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PremadeSongsSeederService } from '../premade-songs/premade-songs-seeder.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  try {
    const seeder = app.get(PremadeSongsSeederService);
    const force = process.argv.includes('--force');
    const refreshAudio = process.argv.includes('--refresh-audio');
    const summary = refreshAudio
      ? await seeder.refreshCatalogAudioUrls()
      : await seeder.seedCatalog({ force });

    console.log(JSON.stringify(summary, null, 2));

    if (summary.failed.length > 0) {
      process.exitCode = 1;
    }
  } finally {
    await app.close();
  }
}

void bootstrap();
