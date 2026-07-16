const fs = require('fs');
const path = require('path');

function formatCSS(content) {
  let result = content;

  // usuń wszystkie istniejące puste linie
  result = result.replace(/\n\s*\n+/g, '\n');

  // usuń puste miejsca przy nawiasach
  result = result.replace(/\s*\{\s*/g, ' {\n');

  let output = '';
  let insideBlock = false;
  let bracketDepth = 0;

  for (let i = 0; i < result.length; i++) {
    const char = result[i];

    if (char === '{') {
      insideBlock = true;
      bracketDepth++;
    }

    if (char === '}') {
      bracketDepth--;

      if (bracketDepth === 0) {
        insideBlock = false;
      }
    }

    // średnik tylko w głównych deklaracjach CSS
    if (char === ';' && insideBlock) {
      output += ';\n';

      // dodajemy wcięcie
      if (bracketDepth > 0) {
        output += '  ';
      }
    } else {
      output += char;
    }
  }

  result = output;

  // zamykanie bloków
  result = result.replace(/\s*\}/g, '\n}');

  // usuń puste linie wewnątrz bloków
  result = result.replace(/;\n\s*\n/g, ';\n');

  // jedna pusta linia między selektorami
  result = result.replace(/\}\n(?=[.#a-zA-Z*@])/g, '}\n\n');

  // usuń nadmiar pustych linii
  result = result.replace(/\n{3,}/g, '\n\n');

  // usuń spacje końcowe
  result = result.replace(/[ \t]+$/gm, '');

  return result.trim() + '\n';
}

function findCSSFiles(directory) {
  fs.readdirSync(directory).forEach((file) => {
    const fullPath = path.join(directory, file);

    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules') {
        findCSSFiles(fullPath);
      }
    }

    if (file.endsWith('.css')) {
      const css = fs.readFileSync(fullPath, 'utf8');

      fs.writeFileSync(fullPath, formatCSS(css));

      console.log(`✔ ${fullPath}`);
    }
  });
}

findCSSFiles('./');
