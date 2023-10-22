const paymentDomains = ['olx.ua', 'en.olx.ua', 'something.olx.ua', 'ria.com', 'kness.energy', 'privat24.ua', 'next.privat24.ua'];

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
    if (distance <= 3 && distance !== 0) return false;
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
  const names = [
    '.tk',
    '.ml',
    '.ga',
    '.cf',
    '.gq',
    '.iz.rs',
    '.nom.za',
    '.us.to',
    'free',
    'ipfs',
    'weeblysite',
    'glitch',
    'blogspot',
  ];
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

function setUnknownOwner() {
  document.getElementById('owner').textContent = 'Невідомий';
}

async function checkUrl(url) {
  if (!url) return;
  url = url.toString();
  if (!url.startsWith('http')) return;
  let simEnabled = true;
  let sslEnabled = true;
  let suspiciousEnabled = true;
  let whoisEnabled = true;
  let suspiciousNamesEnabled = true;
  let similarity = true;
  let sslAvailable = true;
  let suspiciousSymbols = false;
  let whois = true;
  let suspiciousNames = true;
  let oldDomain = true;
  const savedOptions = localStorage.getItem('userOptions');
  if (savedOptions) {
    const options = JSON.parse(savedOptions);
    simEnabled = options.phishing;
    sslEnabled = options.ssl_status;
    suspiciousEnabled = options.cyrillic;
    whoisEnabled = options.domain_age;
    suspiciousNamesEnabled = options.domain;
  }
  if (simEnabled) similarity = similarityCheck(url);
  if (sslEnabled) sslAvailable = lazySSLverification(url);
  if (suspiciousEnabled) suspiciousSymbols = suspiciousSymbolsCheck(url);
  if (whoisEnabled) whois = await getWhoisData(url);
  if (suspiciousNamesEnabled) suspiciousNames = suspiciousNamesCheck(url);
  if (whoisEnabled) {
    if (whois) {
      console.log(whois);
      const currentYear = new Date().getFullYear();
      const creation = whois.data.created || whois.data.creationDate || whois.data.createdOn;
      if (creation) {
        const dateObject = new Date(Date.parse(creation.split(' ')[0]));
        if (dateObject.getFullYear() === currentYear) {
          oldDomain = false;
          document.getElementById(
            'domain-registration-1',
          ).textContent = dateObject.toLocaleString();
        } else {
          oldDomain = true;
          document.getElementById(
            'domain-registration-2',
          ).textContent = dateObject.toLocaleString();
        }
      } else {
        document.getElementById('domain-registration-2').textContent = 'Невідомий';
        document.getElementById('agesafe').classList.add('peace');
      }
      const owner = whois.data.registrantName
                || whois.data.registrantOrganization
                || whois.data.registrant
                || whois.data.adminOrganization
                || whois.data.techOrganization
                || whois.data.techName
                || whois.data.organization
                || whois.data.person;
      if (owner) {
        if (
          owner.toLowerCase().includes('disclosed')
                    || owner.toLowerCase().includes('redacted')
                    || owner.toLowerCase().includes('privacy')
                    || owner.toLowerCase().includes('private')
        ) setUnknownOwner();
        else document.getElementById('owner').textContent = owner;
      } else setUnknownOwner();
    } else setUnknownOwner();
  }

  if (!similarity) {
    const elems = document.querySelectorAll('#phishing');
    elems.forEach((elem) => {
      elem.classList.remove('peace');
    });
    const elems2 = document.querySelectorAll('#phishingsafe');
    elems2.forEach((elem) => {
      elem.classList.add('peace');
    });
  }

  if (!sslAvailable) {
    const elems = document.querySelectorAll('#ssl');
    elems.forEach((elem) => {
      elem.classList.remove('peace');
    });
    const elems2 = document.querySelectorAll('#sslsafe');
    elems2.forEach((elem) => {
      elem.classList.add('peace');
    });
  }

  if (suspiciousSymbols) {
    const elems = document.querySelectorAll('#cyrillic');
    elems.forEach((elem) => {
      elem.classList.remove('peace');
    });
    const elems2 = document.querySelectorAll('#cyrillicsafe');
    elems2.forEach((elem) => {
      elem.classList.add('peace');
    });
  }

  if (!suspiciousNames) {
    const elems = document.querySelectorAll('#domain');
    elems.forEach((elem) => {
      elem.classList.remove('peace');
    });
    const elems2 = document.querySelectorAll('#domainsafe');
    elems2.forEach((elem) => {
      elem.classList.add('peace');
    });
  }

  if (!oldDomain) {
    const elems = document.querySelectorAll('#age');
    elems.forEach((elem) => {
      elem.classList.remove('peace');
    });
    const elems2 = document.querySelectorAll('#agesafe');
    elems2.forEach((elem) => {
      elem.classList.add('peace');
    });
    document.getElementById('agesafe2').classList.add('peace');
  }
}

async function getCurrentUrl() {
  const tabs = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  return checkUrl(tabs[0].url);
}

getCurrentUrl();
