import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const sourceFolder = '../img';
const targetFolder = '../img/safety';

fs.promises.readdir(sourceFolder)
  .then(files => {
    files.forEach(async (file) => {
      if (path.extname(file).toLowerCase() === '.webp') {
        const sourcePath = path.join(sourceFolder, file);
        const targetPath = path.join(targetFolder, file);

        try {
          await sharp(sourcePath)
            .resize(1200, 675)
            .modulate({
              hue: 180,
              saturation: 1.2,
              lightness: 0.8,
            })
            .toFile(targetPath);
          console.log(`Processed ${file} successfully.`);
        } catch (err) {
          console.error(`Error processing ${file}:`, err);
        }
      }
    });
  })
  .catch(err => {
    console.error('Error reading source folder:', err);
  });