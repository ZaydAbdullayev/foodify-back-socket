const crypto = require("crypto");

function generateRandomNumberId(length) {
  // Belirlediğiniz uzunluk kadar rastgele bayt üretin
  const randomBytes = crypto.randomBytes(length);

  // Bu baytları ondalık sayıya dönüştürün
  const randomDecimal = parseInt(randomBytes.toString("hex"), 16);

  // İstediğiniz uzunluğa kadar sayıyı sıfırlarla doldurun
  const id = randomDecimal.toString().padStart(length, "0");

  return id;
}

// Örnek: 6 haneli bir rastgele sayı elde etmek için
const randomId = generateRandomNumberId(6);
console.log(randomId);
