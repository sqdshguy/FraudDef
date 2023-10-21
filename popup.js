const paymentDomains = ['olx.ua', 'en.olx.ua', 'something.olx.ua'];

function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = new Array(m + 1).fill(0).map(() => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i += 1) {
    for (let j = 0; j <= n; j += 1) {
      if (i === 0) dp[i][j] = j;
      else if (j === 0) dp[i][j] = i;
      else if (str1[i - 1] === str2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  return dp[m][n];
}

function similarityCheck(url) {
  const domain = new URL(url).hostname;
  for (let i = 0; i < paymentDomains.length; i += 1) {
    const distance = levenshteinDistance(domain, paymentDomains[i]);
    if (distance <= 2 && distance !== 0) return false;
  }
  return true;
}

function lazySSLverification(url) {
  return url.startsWith('https://');
}

function suspiciousSymbolsCheck(url) {
  const regex = /[^a-zA-Z0-9.:/\-?&]=/;
  return url.length > 200 || regex.test(url);
}

function suspiciousNamesCheck(url) {
  const names = ['.tk', '.ml', '.ga', '.cf', '.gq', '.iz.rs', '.nom.za', '.us.to', 'free', 'ipfs', 'weeblysite', 'glitch', 'blogspot'];
  for (let i = 0; i < names.length; i += 1) {
    if (url.includes(names[i])) return false;
  }
  return true;
}

async function getWhoisData(url) {
  const domain = new URL(url).hostname;
  try {
    const response = await fetch(`http://localhost:3000/whois/${domain}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data;
  } catch (err) {
    return null;
  }
}

async function checkUrl(url) {
  const similarity = similarityCheck(url);
  const sslAvailable = lazySSLverification(url);
  const suspiciousSymbols = suspiciousSymbolsCheck(url);
  const whois = await getWhoisData(url);
  const suspiciousNames = suspiciousNamesCheck(url);
  let oldDomain = true;

  if (whois) {
    console.log(whois);
    const currentYear = new Date().getFullYear();
    const creation = whois.data.created || whois.data.creationDate;
    if (parseInt(creation.split(' ')[0], 10) === currentYear) oldDomain = false;
  }
  const result = ((similarity + sslAvailable + !suspiciousSymbols
    + oldDomain + suspiciousNames) / 5) * 100;
  document.getElementById('result').textContent = `URL safety score: ${result}%`;
}

async function getCurrentUrl() {
  const tabs = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  return checkUrl(tabs[0].url);
}

checkUrl(getCurrentUrl());
document
  .getElementById('checkPage')
  .addEventListener('click', () => checkUrl(document.getElementById('url').value));
