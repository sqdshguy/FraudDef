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
  const regex = /[^a-zA-Z0-9.:/-]/;
  return url.length > 200 || regex.test(url);
}

function getWhoisData(url) {
  const domain = new URL(url).hostname;
  fetch(`http://localhost:3000/whois/${domain}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      console.log('WHOIS data:', data);
      // Do something with the WHOIS data here
    })
    .catch((error) => {
      console.error('Error:', error);
      // Handle errors here
    });
}

function checkUrl(url) {
  const result = similarityCheck(url);
  if (result) document.getElementById('result').textContent = 'Safe';
  else document.getElementById('result').textContent = 'Fishing alert';
  console.log(lazySSLverification(url));
  console.log(suspiciousSymbolsCheck(url));
  console.log(getWhoisData(url));
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
