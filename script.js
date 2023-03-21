const axios = require('axios');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imagesDir = 'downloaded_images';
const resizedImagesDir = 'resized_images';

let downloadedImagesCount = 0;
let resizedImagesCount = 0;

// Створення директорій, якщо вони не існують
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

if (!fs.existsSync(resizedImagesDir)) {
  fs.mkdirSync(resizedImagesDir);
}

// Зчитування файлу з URL-адресами
const urls = fs.readFileSync('input_urls.txt', 'utf-8')
  .split('\n')
  .filter(url => url.trim().length > 0);

// Функція для завантаження та ресайзу зображення за URL-адресою
const downloadImage = async (url) => {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const data = Buffer.from(response.data, 'binary');
    const filename = path.basename(url);
    const filePath = path.join(imagesDir, filename);
    
    fs.writeFileSync(filePath, data);

    // Зчитування зображення з файлу
    const image = sharp(filePath);

    // Отримання розмірів зображення
    const metadata = await image.metadata();
    const { width, height } = metadata;

    // Ресайз зображення
    const resizedImage = await image.resize(300, 300);

    // Збереження зменшеної версії зображення
    const resizedFilePath = path.join(resizedImagesDir, `resized_${filename}`);
    await resizedImage.toFile(resizedFilePath);

    downloadedImagesCount++;
    resizedImagesCount++;
    
    console.log(`Зображення за адресою ${url} було успішно завантажено та зменшено.`);
  } catch (error) {
    console.error(`Помилка завантаження зображення за адресою ${url}: ${error}`);
  }
};

// Завантаження та ресайз зображень за URL-адресами
const downloadImages = async () => {
  for (const url of urls) {
    if (url.trim() !== '') {
      await downloadImage(url.trim());
    }
  }
};

downloadImages().then(() => {
    console.log(`Завантажено ${downloadedImagesCount} зображень.`);
    console.log(`Зменшено ${resizedImagesCount} зображень.`);
}).catch((error) => {
    console.error(error);
});