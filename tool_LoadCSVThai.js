const fs = require('fs');
const csv = require('csv-parser');

// File path for the CSV file
const filePath = './msApps/thai_top_200.csv';

// Define Thai consonants in dictionary order
const thaiConsonants = [
  "ก", "ข", "ฃ", "ค", "ฅ", "ฆ",
  "ง", "จ", "ฉ", "ช", "ซ", "ฌ", "ญ",
  "ฎ", "ฏ", "ฐ", "ฑ", "ฒ", "ณ",
  "ด", "ต", "ถ", "ท", "ธ", "น",
  "บ", "ป", "ผ", "ฝ", "พ", "ฟ", "ภ",
  "ม", "ย", "ร", "ล", "ว", "ศ", "ษ", "ส", "ห", "ฬ", "อ", "ฮ"
];

// Initialize grouped words object
const groupedWords = {};

// Prepare groups based on consonants
thaiConsonants.forEach(consonant => {
  groupedWords[consonant] = [];
});

// Read and process the CSV file
fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', (row) => {
    const thaiWord = row['A']; // Thai word column
    const englishMeaning = row['B']; // English meaning column

    const firstChar = thaiWord[0]; // Extract first character
    if (groupedWords[firstChar]) {
      groupedWords[firstChar].push({ thai: thaiWord, meaning: englishMeaning });
    }
  })
  .on('end', () => {
    // Sort each group by Thai dictionary order
    for (const key in groupedWords) {
      groupedWords[key].sort((a, b) => a.thai.localeCompare(b.thai, 'th'));
    }

    // Filter out empty groups and print the result
    const result = Object.fromEntries(
      Object.entries(groupedWords).filter(([_, words]) => words.length > 0)
    );

    console.log(JSON.stringify(result, null, 2)); // Output the grouped data
    fs.writeFileSync('./msApps/thai_top_200.json',JSON.stringify(result,null,3)) ;
  });