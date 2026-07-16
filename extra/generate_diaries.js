const fs = require('fs');
const path = require('path');

const diaryDir = path.join(__dirname, 'diary');

if (!fs.existsSync(diaryDir)) {
  fs.mkdirSync(diaryDir, { recursive: true });
}

const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function getSeason(month) {
  if (month === 11 || month <= 1) {
    return '冬';
  } else if (month >= 2 && month <= 4) {
    return '春';
  } else if (month >= 5 && month <= 7) {
    return '夏';
  } else {
    return '秋';
  }
}

const weather = [
  '阳光明媚，微风拂面',
  '阴沉沉的天空，下着小雨',
  '蓝天白云，空气清新',
  '天气闷热，让人有些烦躁',
  '秋高气爽，气温适宜',
  '寒风凛冽，格外寒冷',
  '细雨绵绵，湿润了大地',
  '晴朗无云，阳光灿烂',
  '多云转晴，气温舒适',
  '大雾弥漫，能见度低',
];

const shortTemplates = [
  '今天天气不错，心情很好。',
  '加班到很晚，好累啊。',
  '读完了一本书，很有收获。',
  '和朋友吃了顿火锅，开心。',
  '早起跑步，感觉很棒。',
  '收到了期待已久的礼物。',
  '看了一场精彩的电影。',
  '整理了房间，清爽多了。',
  '学习了新的编程技巧。',
  '写代码到深夜，终于解决了bug。',
  '今天是个好日子，值得纪念。',
  '喝了一杯好喝的咖啡，提神醒脑。',
  '睡了个好觉，精神饱满。',
  '吃到了想吃的东西，满足。',
  '散步的时候发现了一处美景。',
];

const mediumTemplates = [
  '今天是个值得纪念的日子。早上醒来阳光明媚，窗外的鸟儿在欢快地歌唱。我决定出去走走，呼吸一下新鲜空气。公园里人很多，有跑步的年轻人，有打太极的老人，还有追逐嬉戏的孩子们。生活中的小确幸，往往就在这些平凡的瞬间中。',
  '工作上遇到了一些挑战，但通过努力都一一克服了。团队协作的力量真是强大，每个人都发挥了自己的特长。晚上和同事们一起吃了饭，聊了很多有趣的话题。回到家已经很晚了，但心情却很舒畅。',
  '周末总是过得很快。今天去了图书馆，借了几本一直想读的书。下午在家煮了一杯咖啡，静静地阅读。这种悠闲的时光真是难得，让人感到无比放松。时间仿佛慢了下来，一切都变得那么美好。',
  '今天尝试了一个新的菜谱，没想到非常成功！看着家人吃得津津有味，心里充满了成就感。烹饪真是一门艺术，需要耐心和细心。以后要多学习一些新菜式，丰富餐桌。',
  '最近一直在思考人生的意义。我们每天忙忙碌碌，到底是为了什么？也许答案就在脚下，就在每一个认真生活的瞬间。珍惜当下，感恩拥有，这才是最重要的。',
  '今天去了公司附近的公园散步，发现秋天真的来了。树叶开始变黄，一片片飘落下来，像一只只蝴蝶。公园里有很多人在散步、跑步、打太极拳，大家都在享受这美好的时光。我也放慢脚步，用心感受着秋天的气息。',
  '今天读了一本很有意思的书，作者的观点很新颖，让我受益匪浅。书里说，人生就像一场马拉松，不在于你跑得多快，而在于你是否能够坚持下去。这句话让我深受启发，我决定以后要更加努力，坚持自己的梦想。',
  '早上起来先做了瑜伽，让身体慢慢苏醒。之后泡了一杯咖啡，坐在窗边看着窗外的风景，享受着这份宁静。上午的工作效率很高，完成了很多任务。中午和同事一起去吃了午餐，聊了很多有趣的话题。',
];

const longSections = [
  '今天是我人生中一个重要的里程碑。回首过去的一年，有欢笑也有泪水，有成功也有挫折。但正是这些经历，塑造了今天的我。记得去年的今天，我还在为一个重要的项目日夜奋战，压力大到几乎喘不过气。但最终，我们不仅按时完成了项目，还获得了客户的高度评价。那一刻，所有的辛苦都变得值得。',
  '这一年来，我学会了很多。学会了如何面对压力，学会了如何与团队协作，学会了如何平衡工作与生活。最重要的是，我学会了相信自己。无论遇到什么困难，只要坚持下去，总会看到曙光。展望未来，我充满了期待。新的一年，我希望能够挑战更多不可能，实现更多梦想。也许路途会很艰难，但我相信，只要心中有光，就一定能够到达彼岸。',
  '今天天气格外好，阳光透过窗户洒进房间，暖洋洋的。我坐在书桌前，思绪万千。想起了很多往事，那些曾经以为永远不会忘记的事情，如今已经渐渐模糊。时间真是个神奇的东西，它能治愈一切伤痛，也能冲淡一切记忆。',
  '记得小时候，最喜欢和小伙伴们一起在院子里玩耍。那时的我们无忧无虑，每天都过得很开心。夏天的时候，我们会一起去河边捉小鱼小虾；冬天的时候，我们会堆雪人打雪仗。那些美好的时光，仿佛就在昨天。长大后，我们各奔东西，很少有机会再聚在一起。但是，那些童年的回忆，却永远留在了心底。每次想起，都会感到温暖和幸福。',
  '人生就像一场旅行，每个人都是过客。有些人会陪伴你走一段路，然后在某个路口挥手告别。但无论如何，感谢他们曾经出现在你的生命中，带给你欢笑和感动。珍惜每一次相遇，珍惜每一段缘分。',
  '工作了这么多年，我渐渐明白，一份好的工作不仅仅是为了赚钱，更是为了实现自我价值。在工作中，我们可以学习新的技能，认识新的朋友，拓展自己的视野。所以，无论做什么工作，都应该用心去做，做到最好。',
  '健康是人生最重要的财富。最近我开始注意锻炼身体，每天坚持跑步、做瑜伽。虽然一开始很辛苦，但慢慢地我发现自己的身体变得更健康了，心情也变得更愉快了。我希望能够一直坚持下去，保持良好的生活习惯。',
  '今天和一位老朋友聊天，她告诉我她最近的生活状态。虽然她遇到了一些困难，但她依然保持着乐观的心态。她的话让我很感动，也让我重新审视自己的生活。我们应该学会在逆境中成长，在困难中寻找希望。',
];

const stories = [
  '记得小时候，每到夏天，我都会和小伙伴们一起去河边游泳。那时候的河水清澈见底，我们在河里嬉戏打闹，度过了很多快乐的时光。现在回想起来，那些日子真是无忧无虑。虽然现在我们都长大了，很少有机会再聚在一起，但那些美好的回忆永远留在了心底。',
  '大学毕业后，我独自一人来到这座城市打拼。刚开始的时候，一切都很艰难。租房子、找工作、适应新的环境，每一步都充满了挑战。但我没有放弃，我相信只要努力，就一定能够成功。现在，我已经在这里站稳了脚跟，有了自己的事业和朋友。回想起那段日子，真是感慨万千。',
  '去年的今天，我做出了一个重要的决定。当时我面临着一个艰难的选择，不知道该怎么办。经过深思熟虑，我终于做出了决定。虽然过程很痛苦，但事实证明，我的选择是正确的。现在的我，比以前更加自信，更加坚定。',
  '今天是我和爱人结婚纪念日。回想起我们一起走过的日子，真是充满了甜蜜和幸福。我们从相识、相知到相爱，经历了很多风风雨雨，但我们始终相互支持，相互理解。我很庆幸能够遇到他，和他一起度过人生的每一天。',
  '小时候家里养了一只小狗，它陪伴了我整个童年。每天放学回家，它都会在门口等着我，摇着尾巴扑到我身上。那段时光真是美好。后来它离开了我们，我伤心了很久。但每当想起它，心里还是暖暖的。',
];

const quotes = [
  '"生活不是等待风暴过去，而是学会在雨中翩翩起舞。"',
  '"人生最重要的不是你站在哪里，而是你朝哪个方向走。"',
  '"每一个不曾起舞的日子，都是对生命的辜负。"',
  '"成功不是终点，失败也不是致命的，重要的是继续前进的勇气。"',
  '"生活中最大的挑战是发现自己是谁，而第二大的挑战是对所发现的感到满意。"',
  '"不要等待机会，而要创造机会。"',
  '"人生没有白走的路，每一步都算数。"',
  '"心若向阳，无畏悲伤。"',
];

function generateShortDiary(date) {
  const season = getSeason(date.getMonth());
  const weekDay = weekDays[date.getDay()];
  const template = shortTemplates[Math.floor(Math.random() * shortTemplates.length)];
  return `## ${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${weekDay} ${season}\n\n${template}`;
}

function generateMediumDiary(date) {
  const season = getSeason(date.getMonth());
  const weekDay = weekDays[date.getDay()];
  const todayWeather = weather[Math.floor(Math.random() * weather.length)];
  const template = mediumTemplates[Math.floor(Math.random() * mediumTemplates.length)];
  
  const tags = ['#生活', '#感悟', '#工作', '#学习', '#心情'];
  const randomTags = tags.sort(() => Math.random() - 0.5).slice(0, 2).join(' ');
  
  const hasQuote = Math.random() > 0.5;
  const quote = hasQuote ? `> ${quotes[Math.floor(Math.random() * quotes.length)]}\n\n` : '';
  
  return `## ${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${weekDay} ${season}\n\n**天气**: ${todayWeather}\n\n${quote}${template}\n\n${randomTags}`;
}

function generateLongDiary(date) {
  const season = getSeason(date.getMonth());
  const weekDay = weekDays[date.getDay()];
  const todayWeather = weather[Math.floor(Math.random() * weather.length)];
  
  const sectionCount = Math.floor(Math.random() * 2) + 2;
  let content = '';
  const usedIndices = [];
  for (let i = 0; i < sectionCount; i++) {
    let idx;
    do {
      idx = Math.floor(Math.random() * longSections.length);
    } while (usedIndices.includes(idx));
    usedIndices.push(idx);
    content += longSections[idx] + '\n\n';
  }
  
  const includeStory = Math.random() > 0.6;
  const story = includeStory ? `## 回忆\n\n${stories[Math.floor(Math.random() * stories.length)]}\n\n` : '';
  
  const hasQuote = Math.random() > 0.5;
  const quote = hasQuote ? `> ${quotes[Math.floor(Math.random() * quotes.length)]}\n\n` : '';
  
  const hasList = Math.random() > 0.5;
  const list = hasList ? `\n### 今日记录\n\n- 完成了3项工作任务\n- 阅读了50页书籍\n- 运动健身1小时\n- 学习了新的知识技能\n\n` : '';
  
  const tags = ['#生活', '#感悟', '#工作', '#学习', '#心情', '#成长', '#回忆', '#未来', '#健康', '#友情'];
  const randomTags = tags.sort(() => Math.random() - 0.5).slice(0, 4).join(' ');
  
  return `# ${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${weekDay} ${season}\n\n**天气**: ${todayWeather}\n\n${quote}${content}${story}${list}${randomTags}`;
}

function generateDiary(date) {
  const rand = Math.random();
  if (rand < 0.2) {
    return generateShortDiary(date);
  } else if (rand < 0.6) {
    return generateMediumDiary(date);
  } else {
    return generateLongDiary(date);
  }
}

function generateDiaries() {
  const startYear = 2024;
  const endYear = 2026;
  let count = 0;
  
  for (let year = startYear; year <= endYear; year++) {
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const today = new Date();
      const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
      const maxDays = isCurrentMonth ? today.getDate() : daysInMonth;
      const daysToGenerate = Math.floor(Math.random() * 11) + 15;
      const actualDays = Math.min(daysToGenerate, maxDays);
      
      const selectedDays = [];
      while (selectedDays.length < actualDays) {
        const day = Math.floor(Math.random() * maxDays) + 1;
        if (!selectedDays.includes(day)) {
          selectedDays.push(day);
        }
      }
      
      selectedDays.sort((a, b) => a - b);
      
      for (const day of selectedDays) {
        const date = new Date(year, month, day);
        const content = generateDiary(date);
        
        const filename = `${year}${String(month + 1).padStart(2, '0')}${String(day).padStart(2, '0')}.md`;
        const filePath = path.join(diaryDir, filename);
        
        fs.writeFileSync(filePath, content, 'utf-8');
        count++;
      }
    }
  }
  
  console.log(`共生成 ${count} 篇示例日记`);
}

generateDiaries();