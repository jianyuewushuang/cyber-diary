const fs = require('fs');
const path = require('path');
const markdownIt = require('markdown-it');

const md = markdownIt({
  html: true,
  linkify: true,
  typographer: true
});

const buildDirDefault = path.join(__dirname, 'build');

function getDiaryDir() {
  const argIndex = process.argv.indexOf('--dir');
  if (argIndex !== -1 && argIndex + 1 < process.argv.length) {
    return path.resolve(process.argv[argIndex + 1]);
  }
  return path.join(__dirname, 'diary');
}

function parseDateFromFilename(filename) {
  let match = filename.match(/^(\d{4})(\d{2})(\d{2})\.md$/);
  if (match) {
    return {
      year: parseInt(match[1]),
      month: parseInt(match[2]),
      day: parseInt(match[3]),
      dateStr: match[1] + '-' + match[2] + '-' + match[3]
    };
  }

  match = filename.match(/^(\d{2})(\d{2})(\d{2})\.md$/);
  if (match) {
    const year = parseInt('20' + match[1]);
    const month = parseInt(match[2]);
    const day = parseInt(match[3]);
    return {
      year: year,
      month: month,
      day: day,
      dateStr: '20' + match[1] + '-' + match[2] + '-' + match[3]
    };
  }

  return null;
}

function readDiaryFiles(diaryDir) {
  const files = fs.readdirSync(diaryDir);
  const diaries = [];

  for (const file of files) {
    const dateInfo = parseDateFromFilename(file);
    if (dateInfo) {
      const filePath = path.join(diaryDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const htmlContent = md.render(content);
      const wordCount = content.length;
      const preview = content.substring(0, 200) + (content.length > 200 ? '...' : '');

      diaries.push({
        filename: file,
        dateStr: dateInfo.dateStr,
        year: dateInfo.year,
        month: dateInfo.month,
        day: dateInfo.day,
        content: content,
        htmlContent: htmlContent,
        wordCount: wordCount,
        preview: preview
      });
    }
  }

  return diaries.sort((a, b) => a.dateStr.localeCompare(b.dateStr));
}

function generateStats(diaries) {
  const stats = {
    byYear: {},
    byMonth: {},
    byWeek: {},
    byDate: {}
  };

  for (const diary of diaries) {
    const yearKey = diary.year.toString();
    const monthKey = diary.year + '-' + String(diary.month).padStart(2, '0');
    const weekKey = getWeekNumber(diary.dateStr);
    const dateKey = diary.dateStr;

    stats.byYear[yearKey] = stats.byYear[yearKey] || { count: 0, words: 0 };
    stats.byYear[yearKey].count++;
    stats.byYear[yearKey].words += diary.wordCount;

    stats.byMonth[monthKey] = stats.byMonth[monthKey] || { count: 0, words: 0 };
    stats.byMonth[monthKey].count++;
    stats.byMonth[monthKey].words += diary.wordCount;

    stats.byWeek[weekKey] = stats.byWeek[weekKey] || { count: 0, words: 0 };
    stats.byWeek[weekKey].count++;
    stats.byWeek[weekKey].words += diary.wordCount;

    stats.byDate[dateKey] = {
      count: 1,
      words: diary.wordCount
    };
  }

  if (diaries.length > 0) {
    const firstDate = new Date(diaries[0].dateStr);
    const lastDate = new Date(diaries[diaries.length - 1].dateStr);

    for (const yearKey of Object.keys(stats.byYear)) {
      const year = parseInt(yearKey);
      for (let month = 1; month <= 12; month++) {
        const monthKey = year + '-' + String(month).padStart(2, '0');
        if (!stats.byMonth[monthKey]) {
          stats.byMonth[monthKey] = { count: 0, words: 0 };
        }
      }
    }

    const currentDate = new Date(firstDate);
    while (currentDate <= lastDate) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const day = currentDate.getDate();
      const dateKey = year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
      const weekKey = getWeekNumber(dateKey);

      if (!stats.byDate[dateKey]) {
        stats.byDate[dateKey] = { count: 0, words: 0 };
      }

      if (!stats.byWeek[weekKey]) {
        stats.byWeek[weekKey] = { count: 0, words: 0 };
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return stats;
}

function getWeekNumber(dateStr) {
  const date = new Date(dateStr);
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date - startOfYear;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const weekNum = Math.ceil(diff / oneWeek);
  return date.getFullYear() + '-W' + String(weekNum).padStart(2, '0');
}

function generateHTML(diaries, stats) {
  const templatePath = path.join(__dirname, 'template.html');
  let template = fs.readFileSync(templatePath, 'utf-8');

  template = template.replace('{{DIARIES_DATA}}', JSON.stringify(diaries));
  template = template.replace('{{STATS_DATA}}', JSON.stringify(stats));

  return template;
}

function copyResources(buildDir, diaryDir) {
  const sourceResourcesDir = path.resolve(path.join(diaryDir, '..', 'resources'));
  const destResourcesDir = path.resolve(path.join(buildDir, 'resources'));

  console.log('[copyResources] 源目录:', sourceResourcesDir);
  console.log('[copyResources] 目标目录:', destResourcesDir);

  if (fs.existsSync(sourceResourcesDir)) {
    if (fs.existsSync(destResourcesDir)) {
      fs.rmSync(destResourcesDir, { recursive: true });
      console.log('[copyResources] 已删除旧的目标目录');
    }
    fs.cpSync(sourceResourcesDir, destResourcesDir, { recursive: true });
    const list = [];
    walkDir(destResourcesDir, '', list);
    console.log('[copyResources] 已复制', list.length, '个文件:', list.join(', '));
  } else {
    console.log('[copyResources] 源目录不存在，跳过复制');
  }
}

function walkDir(dir, relative, result) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const relPath = relative + entry.name + (entry.isDirectory() ? '/' : '');
    result.push(relPath);
    if (entry.isDirectory()) {
      walkDir(path.join(dir, entry.name), relative + entry.name + '/', result);
    }
  }
}

function build(diaryDir, options) {
  options = options || {};
  const buildDir = options.buildDir || buildDirDefault;
  const isDev = options.isDev || false;

  if (!fs.existsSync(diaryDir)) {
    console.log('diary 文件夹不存在，正在创建...');
    fs.mkdirSync(diaryDir, { recursive: true });
  }

  if (!fs.existsSync(buildDir)) {
    console.log('build 文件夹不存在，正在创建...');
    fs.mkdirSync(buildDir, { recursive: true });
  }

  const diaries = readDiaryFiles(diaryDir);
  console.log(`找到 ${diaries.length} 篇日记`);

  const stats = generateStats(diaries);
  const html = generateHTML(diaries, stats);

  fs.writeFileSync(path.join(buildDir, 'index.html'), html);
  console.log('HTML 文件已生成到 build 文件夹');

  copyResources(buildDir, diaryDir);
}

function main() {
  const diaryDir = getDiaryDir();
  build(diaryDir, { isDev: true });
}

if (require.main === module) {
  main();
}

module.exports = { build, getDiaryDir };
