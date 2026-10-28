import React, { useCallback, useEffect, useMemo, useState } from 'react';

const MOEX_API_BASE = 'https://iss.moex.com/iss';

const riskBackgrounds = {
  low: 'rgba(30,155,89,.28)', medium: 'rgba(223,178,37,.25)', high: 'rgba(218,57,68,.30)',
  lowMedium: 'rgba(62,170,123,.25)', mediumHigh: 'rgba(226,112,48,.27)',
  reliable: 'rgba(25,152,91,.26)', good: 'rgba(130,184,59,.24)',
  worthy: 'rgba(224,172,53,.25)', profitable: 'rgba(224,115,45,.28)',
  scary: 'rgba(191,46,69,.32)',
};

const targetPresets = [
  { label: 'Цель', value: 1000 },
  { label: 'Цель', value: 10000 },
  { label: 'Цель', value: 30000 },
  { label: 'Цель', value: 50000 },
  { label: 'Цель', value: 150000 },
];

const scenarios = {
  low: {
    title: 'Низкий риск',
    avgYield: 13.3,
    color: '#22c55e',
    description: 'ОФЗ — самый консервативный вариант. Подходит для спокойного накопления капитала и регулярного купонного дохода.',
    bonds: [
      { name: 'ОФЗ 26239', secid: 'SU26239RMFS2', term: 'на 5 лет' },
      { name: 'ОФЗ 26240', secid: 'SU26240RMFS0', term: 'на 10 лет' },
      { name: 'ОФЗ 26246', secid: 'SU26246RMFS7', term: 'на 9 лет' },
      { name: 'ОФЗ 26247', secid: 'SU26247RMFS5', term: 'на 12 лет' },
      { name: 'ОФЗ 26248', secid: 'SU26248RMFS3', term: 'на 13 лет' },
      { name: 'ОФЗ 26254', secid: 'SU26254RMFS1', term: 'на 14 лет' },
    ],
  },
  medium: {
    title: 'Средний риск',
    avgYield: 17.9,
    color: '#3b82f6',
    description: 'Баланс между доходностью и риском. Доходность выше, но возможны более сильные колебания цены облигаций.',
    bonds: [
      { name: 'Селигдар 001Р-10', secid: 'RU000A10EC22', term: 'на 2 года 9 месяцев' },
      { name: 'Новые Технологии 001Р-08', secid: 'RU000A10CMQ5', term: 'на 1 год 3 месяца' },
      { name: 'ВИС ФИНАНС БО-П11', secid: 'RU000A10EES4', term: 'на 2 года 9 месяцев' },
      { name: 'Село Зелёное 001Р-02', secid: 'RU000A10DQ68', term: 'на 1 год 6 месяцев' },
      { name: 'АФК Система БО 002Р-06', secid: 'RU000A10DPW4', term: 'на 2 года' },
    ],
  },
  high: {
    title: 'Высокий риск',
    avgYield: 18,
    color: '#f97316',
    description: 'Более высокая доходность, но и выше риск просадок цены и проблем с выплатами. Подходит только для небольшой части портфеля.',
    bonds: [
      { name: 'ТГК-14 001Р-05', secid: 'RU000A10AS02', term: 'срок по данным MOEX' },
      { name: 'Эталон-Финанс 002Р-05', secid: 'RU000A10EST2', term: 'на 2 года 10 месяцев' },
      { name: 'АйДи Коллект 001Р-08', secid: 'RU000A10F0W2', term: 'на 1 год 11 месяцев' },
      { name: 'МФК Мани Мен БО-01', secid: 'RU000A10AYU6', term: 'на 1 год 9 месяцев' },
      { name: 'МСБ-Лизинг 003Р-07', secid: 'RU000A10EB07', term: 'на 2 года 8 месяцев' },
    ],
  },
  lowMedium: {
    title: 'Низко-средний риск',
    avgYield: 0,
    color: '#14b8a6',
    description: 'Смешанная подборка из ОФЗ и корпоративных облигаций с умеренным уровнем риска.',
    bonds: [
      { name: 'ОФЗ 26248', secid: 'SU26248RMFS3', term: 'срок по данным MOEX' },
      { name: 'ОФЗ 26254', secid: 'SU26254RMFS1', term: 'срок по данным MOEX' },
      { name: 'Авто Финанс Банк БО-001Р-16', secid: 'RU000A10D9K0', term: 'срок по данным MOEX' },
      { name: 'Группа Позитив 001Р-03', secid: 'RU000A10BWC6', term: 'срок по данным MOEX' },
      { name: 'КАМАЗ ПАО БО-П18', secid: 'RU000A10DP93', term: 'срок по данным MOEX' },
    ],
  },
  mediumHigh: {
    title: 'Средне-высокий риск',
    avgYield: 0,
    color: '#a855f7',
    description: 'Корпоративная подборка с повышенной потенциальной доходностью и более высоким кредитным риском.',
    bonds: [
      { name: 'ОДК 001Р-01', secid: 'RU000A10ES32', term: 'срок по данным MOEX' },
      { name: 'Глоракс 002Р-01', secid: 'RU000A10FMQ8', term: 'срок по данным MOEX' },
      { name: 'Софтлайн 002Р-02', secid: 'RU000A10EA08', term: 'срок по данным MOEX' },
      { name: 'реСтор 001Р-02', secid: 'RU000A10DMN0', term: 'срок по данным MOEX' },
      { name: 'Синара транспортные машины 1Р4', secid: 'RU000A1082Y8', term: 'срок по данным MOEX' },
    ],
  },
  reliable: {
    title: 'Надежный портфель',
    avgYield: 0,
    color: '#22c55e',
    description: 'Подборка облигаций. Актуальные цены и параметры загружаются с MOEX при обновлении.',
    bonds: [
      { name: 'Сбербанк 001Р-SBER52', secid: 'RU000A10EF52', term: 'срок по данным MOEX' },
      { name: 'Атомэнергопром 001Р-11', secid: 'RU000A10EJQ7', term: 'срок по данным MOEX' },
      { name: 'ИКС 5 Финанс 003Р-17', secid: 'RU000A10E6V2', term: 'срок по данным MOEX' },
      { name: 'Сибур Холдинг 001Р-07', secid: 'RU000A10C8T4', term: 'срок по данным MOEX' },
      { name: 'ФосАгро БО-02-06', secid: 'RU000A10ER66', term: 'срок по данным MOEX' },
    ],
  },
  good: {
    title: 'Хороший портфель',
    avgYield: 0,
    color: '#0ea5e9',
    description: 'Подборка облигаций. Актуальные цены и параметры загружаются с MOEX при обновлении.',
    bonds: [
      { name: 'РЖД 001Р-50R', secid: 'RU000A10DZW3', term: 'срок по данным MOEX' },
      { name: 'ПГК 003Р-04', secid: 'RU000A10EYV6', term: 'срок по данным MOEX' },
      { name: 'Новабэв Групп 003Р-02', secid: 'RU000A10E7G1', term: 'срок по данным MOEX' },
      { name: 'Селигдар 001Р-08', secid: 'RU000A10DTF1', term: 'срок по данным MOEX' },
      { name: 'ИнАрктика 002Р-04', secid: 'RU000A10DHX9', term: 'срок по данным MOEX' },
    ],
  },
  worthy: {
    title: 'Достойный портфель',
    avgYield: 0,
    color: '#6366f1',
    description: 'Подборка облигаций. Актуальные цены и параметры загружаются с MOEX при обновлении.',
    bonds: [
      { name: 'АФК Система 002Р-06', secid: 'RU000A10DPW4', term: 'срок по данным MOEX' },
      { name: 'Биннофарм 001Р-04', secid: 'RU000A10AS28', term: 'срок по данным MOEX' },
      { name: 'Фабрика 001Р-01', secid: 'RU000A10FX18', term: 'срок по данным MOEX' },
      { name: 'ТрансКонтейнер П02-03', secid: 'RU000A10F470', term: 'срок по данным MOEX' },
      { name: 'Синара ТМ 1Р8', secid: 'RU000A10FN36', term: 'срок по данным MOEX' },
    ],
  },
  profitable: {
    title: 'Доходный портфель',
    avgYield: 0,
    color: '#f59e0b',
    description: 'Подборка облигаций. Актуальные цены и параметры загружаются с MOEX при обновлении.',
    bonds: [
      { name: 'АБЗ-1 002Р-04', secid: 'RU000A10DCK7', term: 'срок по данным MOEX' },
      { name: 'Глоракс 001Р-05', secid: 'RU000A10E655', term: 'срок по данным MOEX' },
      { name: 'Кокс 001Р-02', secid: 'RU000A10B0R6', term: 'срок по данным MOEX' },
      { name: 'Воксис 001Р-02', secid: 'RU000A10E9Z7', term: 'срок по данным MOEX' },
      { name: 'ТГК-14 001Р-05', secid: 'RU000A10AS02', term: 'срок по данным MOEX' },
    ],
  },
  scary: {
    title: 'Страшный портфель',
    avgYield: 0,
    color: '#ef4444',
    description: 'Подборка облигаций. Актуальные цены и параметры загружаются с MOEX при обновлении.',
    bonds: [
      { name: 'МСБ-Лизинг 003Р-04', secid: 'RU000A10B735', term: 'срок по данным MOEX' },
      { name: 'Энергоника 001Р-06', secid: 'RU000A10BNK8', term: 'срок по данным MOEX' },
      { name: 'Каршеринг Руссия 001Р-08', secid: 'RU000A10F512', term: 'срок по данным MOEX' },
      { name: 'Новосибирскавтодор БО-03', secid: 'RU000A10B461', term: 'срок по данным MOEX' },
      { name: 'Полипласт П02-БО-16', secid: 'RU000A10F7V9', term: 'срок по данным MOEX' },
    ],
  },
};

function toNumber(value, fallback = 0) {
  const number = Number(String(value).replace(',', '.'));
  return Number.isFinite(number) ? number : fallback;
}

function positive(value, fallback = 0) {
  return Math.max(0, toNumber(value, fallback));
}

function money(value, digits = 0) {
  const safeValue = Number.isFinite(value) ? Math.max(0, value) : 0;
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(safeValue);
}

function price(value) {
  if (!Number.isFinite(value)) return '—';
  return money(value, 2);
}

function percent(value) {
  if (!Number.isFinite(value)) return '—';
  return `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2, minimumFractionDigits: 1 }).format(value)}%`;
}

function tableRows(table) {
  if (!table?.columns || !table?.data) return [];
  return table.data.map((row) => table.columns.reduce((acc, col, i) => ({ ...acc, [col]: row[i] }), {}));
}

function firstNumber(...values) {
  for (const value of values) {
    const number = toNumber(value, NaN);
    if (Number.isFinite(number) && number > 0) return number;
  }
  return null;
}

async function findSecid(query) {
  const response = await fetch(`${MOEX_API_BASE}/securities.json?q=${encodeURIComponent(query)}&iss.meta=off`);
  if (!response.ok) throw new Error('MOEX search error');
  const data = await response.json();
  const rows = tableRows(data.securities);
  const bond = rows.find((item) => item.type === 'bond' && item.secgroup === 'stock_bonds') || rows[0];
  return bond?.secid || bond?.SECID || null;
}

async function fetchBond(bond) {
  const secid = bond.secid || (bond.query ? await findSecid(bond.query) : null);
  if (!secid) return null;

  const response = await fetch(`${MOEX_API_BASE}/engines/stock/markets/bonds/securities/${encodeURIComponent(secid)}.json?iss.meta=off&iss.only=securities,marketdata`);
  if (!response.ok) throw new Error('MOEX quote error');
  const data = await response.json();
  const security = tableRows(data.securities)[0] || {};
  const market = tableRows(data.marketdata)[0] || {};

  const rawPrice = firstNumber(
    market.LAST,
    market.MARKETPRICE,
    market.LCURRENTPRICE,
    market.WAPRICE,
    security.PREVPRICE,
    security.LPREVPRICE
  );
  const faceValue = firstNumber(
    security.FACEVALUE,
    security.INITIALFACEVALUE,
    security.NOMINAL,
    security.LOTVALUE
  ) || 1000;

  // MOEX для облигаций обычно отдаёт цену в процентах от номинала.
  // Поэтому правильная цена в рублях = цена (%) × номинал / 100.
  const bondPrice = rawPrice ? (rawPrice * faceValue) / 100 : null;
  const yieldValue = firstNumber(market.YIELD, market.YIELDATWAP, market.EFFECTIVEYIELD, security.YIELDATPREVWAPRICE, security.COUPONPERCENT);

  let couponValue = firstNumber(security.COUPONVALUE);
  if (bond.name === 'МФК Мани Мен БО-01') couponValue = 21.78;

  const couponPeriod = firstNumber(security.COUPONPERIOD) || 182;
  const couponYield = couponValue && couponPeriod && bondPrice ? ((couponValue * (365 / couponPeriod)) / bondPrice) * 100 : firstNumber(security.COUPONPERCENT);

  return {
    secid,
    price: bondPrice,
    rawPrice,
    faceValue,
    yield: yieldValue,
    couponValue,
    couponPeriod,
    couponYield,
    nextCouponDate: security.NEXTCOUPON || security.COUPONDATE || null,
    maturityDate: security.MATDATE || null,
  };
}

function allBonds() {
  return Object.values(scenarios).flatMap((scenario) => scenario.bonds);
}

function scenarioYield(scenario, quotes) {
  const values = scenario.bonds.map((bond) => quotes[bond.name]?.yield).filter((v) => Number.isFinite(v) && v > 0);
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : scenario.avgYield;
}

function calculatePlan({ scenario, quotes, targetMonthlyIncome, years, reinvest }) {
  const rows = scenario.bonds.map((bond) => {
    const q = quotes[bond.name] || {};
    const bondPrice = Number.isFinite(q.price) && q.price > 0 ? q.price : 1000;
    const couponValue = Number.isFinite(q.couponValue) && q.couponValue > 0 ? q.couponValue : 0;
    const couponPeriod = Number.isFinite(q.couponPeriod) && q.couponPeriod > 0 ? q.couponPeriod : 182;
    const monthlyCoupon = (couponValue * (365 / couponPeriod)) / 12;
    return { name: bond.name, price: bondPrice, couponValue, couponPeriod, monthlyCoupon };
  });

  const targetIncome = positive(targetMonthlyIncome);
  const activeRows = rows.filter((row) => row.price > 0 && row.monthlyCoupon > 0);
  const monthlyYieldPerRuble = activeRows.reduce((sum, row) => sum + row.monthlyCoupon / row.price, 0);
  const equalInvestmentTarget = targetIncome > 0 && monthlyYieldPerRuble > 0
    ? targetIncome / monthlyYieldPerRuble
    : 0;

  let allocation = rows.map((row) => {
    const quantity = row.price > 0 && equalInvestmentTarget > 0
      ? Math.max(1, Math.round(equalInvestmentTarget / row.price))
      : 0;
    return {
      ...row,
      quantity,
      invested: row.price * quantity,
      monthlyIncome: row.monthlyCoupon * quantity,
    };
  });

  // Балансировка: покупаем примерно одинаковую сумму в каждую облигацию,
  // но при необходимости докупаем недостающие бумаги до достижения цели по доходу.
  let monthlyPayment = allocation.reduce((sum, row) => sum + row.monthlyIncome, 0);
  let guard = 0;
  while (monthlyPayment < targetIncome && guard < 100000) {
    const minIndex = allocation.reduce((bestIndex, row, index, arr) => (
      row.invested < arr[bestIndex].invested ? index : bestIndex
    ), 0);
    const row = allocation[minIndex];
    allocation[minIndex] = {
      ...row,
      quantity: row.quantity + 1,
      invested: row.price * (row.quantity + 1),
      monthlyIncome: row.monthlyCoupon * (row.quantity + 1),
    };
    monthlyPayment += row.monthlyCoupon;
    guard += 1;
  }

  const averageInvested = allocation.length
    ? allocation.reduce((sum, row) => sum + row.invested, 0) / allocation.length
    : 0;
  allocation = allocation.sort((a, b) => a.name.localeCompare(b.name, 'ru')).map((row) => ({
    ...row,
    targetInvested: averageInvested,
  }));

  const setsNeeded = allocation.length ? Math.max(...allocation.map((row) => row.quantity)) : 0;
  const targetCapital = allocation.reduce((sum, row) => sum + row.invested, 0);
  monthlyPayment = allocation.reduce((sum, row) => sum + row.monthlyIncome, 0);
  const totalBonds = allocation.reduce((sum, row) => sum + row.quantity, 0);
  const avgPrice = totalBonds ? targetCapital / totalBonds : 1000;
  const annualCouponIncome = monthlyPayment * 12;
  const couponYield = targetCapital ? (annualCouponIncome / targetCapital) * 100 : scenario.avgYield;
  const months = Math.max(1, Math.round(positive(years, 1) * 12));
  const annualRate = Math.max(0, couponYield);
  const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
  const monthlySaving = reinvest && monthlyRate > 0
    ? targetCapital / (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate))
    : targetCapital / months;

  return { allocation, setsNeeded, targetCapital, monthlyPayment, totalBonds, avgPrice, couponYield, monthlySaving };
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function monthName(date) {
  return new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(date);
}

function couponCalendar(scenario, quotes, allocation) {
  const now = new Date();
  const end = new Date(now);
  end.setMonth(end.getMonth() + 12);
  const quantity = Object.fromEntries(allocation.map((item) => [item.name, item.quantity]));
  const months = {};

  scenario.bonds.forEach((bond, index) => {
    const q = quotes[bond.name] || {};
    const couponValue = q.couponValue;
    const couponPeriod = q.couponPeriod || 182;
    let date = q.nextCouponDate ? new Date(q.nextCouponDate) : addDays(now, 30 + index * 20);
    if (Number.isNaN(date.getTime())) date = addDays(now, 30 + index * 20);
    while (date < now) date = addDays(date, couponPeriod);

    while (date <= end) {
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const total = Number.isFinite(couponValue) ? couponValue * (quantity[bond.name] || 0) : null;
      if (!months[key]) months[key] = { key, month: monthName(date), year: date.getFullYear(), total: 0, payments: [] };
      months[key].payments.push({ name: bond.name, date: date.toLocaleDateString('ru-RU'), timestamp: date.getTime(), quantity: quantity[bond.name] || 0, total });
      if (Number.isFinite(total)) months[key].total += total;
      date = addDays(date, couponPeriod);
    }
  });

  return Object.values(months)
    .map((month) => ({ ...month, payments: month.payments.sort((a, b) => a.timestamp - b.timestamp) }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

function simulate({ monthlyContribution, years, annualRate, reinvest, targetCapital }) {
  const months = Math.max(12, Math.round(positive(years, 1) * 12));
  const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
  let capital = 0;
  let reachedMonth = null;
  const data = [];

  for (let month = 1; month <= months; month += 1) {
    capital += positive(monthlyContribution);
    const income = capital * monthlyRate;
    if (reinvest) capital += income;
    if (!reachedMonth && targetCapital && capital >= targetCapital) reachedMonth = month;
    if (month % 12 === 0) data.push({ year: month / 12, capital });
  }
  return { capital, reachedMonth, data };
}

function goalTime(months) {
  if (!months) return 'Позже выбранного срока';
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (!y) return `${m} мес.`;
  return m ? `${y} г. ${m} мес.` : `${y} г.`;
}
function scenarioTermComment(scenario, years) {
  if (scenario.title === 'Низкий риск') {
    return 'ОФЗ — более длинные и ликвидные государственные облигации, но их цена тоже может меняться при изменении ключевой ставки, инфляции и ситуации на рынке.';
  }

  const yearText = years >= 5 ? `Выбран горизонт ${years} лет, а часть корпоративных выпусков может погаситься раньше.` : 'У корпоративных выпусков срок обращения обычно короче, чем у долгосрочной цели.';
  return `${yearText} После погашения деньги и полученные купоны нужно будет перекладывать в новые подходящие облигации. Цена облигаций может меняться из-за ключевой ставки, инфляции, кредитного риска эмитента и общей ситуации в экономике.`;
}


function Toggle({ checked, onChange }) {
  return (
    <button className="toggle" type="button" onClick={() => onChange(!checked)}>
      <span>
        <strong>Реинвестировать доход</strong>
        <small>Купоны снова вкладываются в портфель</small>
      </span>
      <span className={`switch ${checked ? 'on' : ''}`}><span /></span>
    </button>
  );
}

function MiniChart({ data }) {
  const max = Math.max(...data.map((item) => item.capital), 1);
  return (
    <div className="chart-wrap">
      <div className="chart-y"><span>{money(max)}</span><span>{money(max / 2)}</span><span>0 ₽</span></div>
      <div className="chart-area">
        <div className="chart">
          {data.map((item) => (
            <div className="bar-group" key={item.year}>
              <div className="bar-track"><div className="bar" style={{ height: `${Math.max(5, (item.capital / max) * 100)}%` }} /></div>
              <span>{item.year}г</span>
            </div>
          ))}
        </div>
        <div className="chart-x">Срок инвестирования, годы</div>
      </div>
    </div>
  );
}

function runTests() {
  const fake = {
    title: 'Тест',
    avgYield: 10,
    bonds: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
  };
  const quotes = {
    A: { price: 940, couponValue: 45, couponPeriod: 182, yield: 11 },
    B: { price: 1030, couponValue: 55, couponPeriod: 182, yield: 12 },
    C: { price: 1120, couponValue: 60, couponPeriod: 182, yield: 13 },
  };
  const plan = calculatePlan({ scenario: fake, quotes, targetMonthlyIncome: 10000, years: 5, reinvest: true });
  const planNoRe = calculatePlan({ scenario: fake, quotes, targetMonthlyIncome: 10000, years: 5, reinvest: false });
  const investments = plan.allocation.map((row) => row.invested);
  const average = investments.reduce((a, b) => a + b, 0) / investments.length;
  const maxDeviation = Math.max(...investments.map((value) => Math.abs(value - average)));

  return [
    plan.monthlyPayment >= 10000,
    plan.targetCapital > 0,
    plan.totalBonds > 0,
    plan.allocation.every((row) => Number.isFinite(row.invested) && Number.isFinite(row.monthlyIncome) && row.quantity > 0),
    maxDeviation <= Math.max(...plan.allocation.map((row) => row.price)),
    plan.monthlySaving > 0,
    plan.monthlySaving < planNoRe.monthlySaving,
  ].every(Boolean);
}

const testsPassed = runTests();

export default function App() {
  const [targetMonthlyIncome, setTargetMonthlyIncome] = useState(30000);
  const [selected, setSelected] = useState('low');
  const [years, setYears] = useState(10);
  const [reinvest, setReinvest] = useState(true);
  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);

  const scenario = scenarios[selected];

  const updateQuotes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const bonds = allBonds();
      const results = await Promise.allSettled(bonds.map(fetchBond));
      const next = {};
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) next[bonds[index].name] = result.value;
      });
      setQuotes(next);
      setUpdatedAt(new Date());
      const failed = results.filter((item) => item.status === 'rejected' || !item.value).length;
      if (failed) setError(`Не удалось обновить ${failed} бумаг. Часть данных показана по запасным значениям.`);
    } catch {
      setError('Не удалось получить цены с MOEX. Попробуйте обновить позже.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { updateQuotes(); }, [updateQuotes]);

  const yields = useMemo(() => Object.fromEntries(Object.entries(scenarios).map(([key, item]) => [key, scenarioYield(item, quotes)])), [quotes]);
  const liveYield = yields[selected] || scenario.avgYield;
  const plan = useMemo(() => calculatePlan({ scenario, quotes, targetMonthlyIncome, years, reinvest }), [scenario, quotes, targetMonthlyIncome, years, reinvest]);
  const growth = useMemo(() => simulate({ monthlyContribution: plan.monthlySaving, years, annualRate: liveYield, reinvest, targetCapital: plan.targetCapital }), [plan.monthlySaving, plan.targetCapital, years, liveYield, reinvest]);
  const calendar = useMemo(() => couponCalendar(scenario, quotes, plan.allocation), [scenario, quotes, plan.allocation]);

  return (
    <main className="page">
      <header className="hero">
        <div>
          <h1>Калькулятор пассивного дохода на облигациях</h1>
          <p>Хотите посчитать, какой нужен капитал, чтобы получать желаемый пассивный доход с разных облигаций? Выберите цель, срок и сценарий согласно вашему риску — калькулятор покажет, каким может быть результат:</p>
          <ul className="hero-benefits"><li>С учетом реинвестирования и без</li><li>С календарем выплат</li><li>С графиком роста капитала</li></ul>
        </div>
      </header>

      <section className="main-card">
        <div className="goal-block">
          <div>
            <h2>Цель по пассивному доходу в месяц</h2>
            <p>Можно выбрать готовую сумму или ввести свою.</p>
          </div>
          <div className="preset-row">
            {targetPresets.map((item) => (
              <button key={item.label} className={targetMonthlyIncome === item.value ? 'active' : ''} type="button" onClick={() => setTargetMonthlyIncome(item.value)}>
                {item.label} — {money(item.value)}
              </button>
            ))}
          </div>
          <label className="big-input">
            <input type="number" value={targetMonthlyIncome} onChange={(event) => setTargetMonthlyIncome(positive(event.target.value))} />
            <span>₽ / мес.</span>
          </label>
        </div>

        <div className="top-grid">
          <section className="panel">
            <div className="panel-head">
              <h3>Вариант инвестирования</h3>
              <button className="refresh" type="button" onClick={updateQuotes} disabled={loading}>{loading ? 'Обновляю...' : 'Обновить цены MOEX'}</button>
            </div>
            <p className="muted">{updatedAt ? `Цены обновлены: ${updatedAt.toLocaleString('ru-RU')}` : 'Цены загрузятся автоматически'}</p>
            {error ? <div className="error">{error}</div> : null}

            <div className="scenario-tabs">
              {Object.entries(scenarios).map(([key, item]) => (
                <button key={key} className={selected === key ? 'active' : ''} style={{ '--accent': item.color, '--risk-bg': riskBackgrounds[key] || 'rgba(61,139,244,.18)' }} onClick={() => setSelected(key)} type="button">
                  <strong>{item.title}</strong>
                  <span>{percent(yields[key] || item.avgYield)} доходность</span>
                </button>
              ))}
            </div>

            <div className="preview">
              <div className="preview-head">
                <div>
                  <strong>{scenario.description.split('—')[0].trim()}</strong>
                  <p>{scenario.description.split('—').slice(1).join('—').trim()}</p>
                </div>
                <span style={{ borderColor: scenario.color, color: scenario.color }}>{scenario.bonds.length} бумаг</span>
              </div>
              <div className="mini-bonds">
                {scenario.bonds.map((bond) => {
                  const q = quotes[bond.name];
                  const item = plan.allocation.find((row) => row.name === bond.name);
                  return <div key={bond.name}><strong>{bond.name}</strong><span>ISIN: {bond.secid || q?.secid || '—'}</span><span>{price(q?.price || item?.price)} · купить {item?.quantity?.toLocaleString('ru-RU') || 0} шт.</span></div>;
                })}
              </div>
            </div>
          </section>

          <aside className="side-panel">
            <div className="black-card">
              <span>Нужно вложить</span>
              <strong>{money(plan.targetCapital)}</strong>
              <small>Чтобы получать около {money(plan.monthlyPayment)} в месяц по купонам</small>
            </div>

            <div className="saving-card">
              <h3>Срок накопления и ежемесячный взнос</h3>
              <p>{reinvest ? 'Передвиньте ползунок срока: с учётом реинвестирования купонов ежемесячный взнос становится меньше.' : 'Передвиньте ползунок срока: без реинвестирования купонов ежемесячный взнос будет выше.'}</p>
              <div className="saving-row">
                <div><span>Срок накопления</span><strong>{years} лет</strong></div>
                <div><span>Нужно откладывать</span><strong>{money(plan.monthlySaving)} / мес.</strong></div>
              </div>
              <input className="range" type="range" min="1" max="30" value={years} onChange={(e) => setYears(positive(e.target.value, 1))} />
              <div className="range-scale"><span>1 год</span><span>10 лет</span><span>20 лет</span><span>30 лет</span></div>
            </div>

            <Toggle checked={reinvest} onChange={setReinvest} />

            <div className="green-card">
              <p>{reinvest ? 'Купоны автоматически докупают облигации и ускоряют достижение цели.' : 'Купоны выводятся, а не докупают новые облигации.'}</p>
              <div className="green-grid"><div><span>Капитал через {years} лет</span><strong>{money(growth.capital)}</strong></div><div><span>Цель будет достигнута</span><strong>{goalTime(growth.reachedMonth)}</strong></div></div>
            </div>
          </aside>
        </div>
      </section>

      <section className="content-grid">
        <section className="panel">
          <h2>Сколько нужно вложить для вашей цели</h2>
          <p className="muted">Сумма распределяется сбалансированно: калькулятор подбирает количество бумаг так, чтобы вложения в каждую облигацию были примерно одинаковыми.</p>
          <div className="stats-row"><div><span>Всего облигаций</span><strong>{plan.totalBonds.toLocaleString('ru-RU')} шт.</strong></div><div><span>Средняя цена</span><strong>{price(plan.avgPrice)}</strong></div></div>
          <div className="allocation-list">
            {plan.allocation.map((item) => <div key={item.name}><div><strong>{item.name}</strong><span>{price(item.price)} × {item.quantity.toLocaleString('ru-RU')} шт.</span></div><div><strong>{money(item.invested)}</strong><span>≈ {money(item.monthlyIncome)} / мес.</span></div></div>)}
          </div>
          <div className="disclaimer-inline">Не является индивидуальной инвестиционной рекомендацией. Итоговая подборка, количество бумаг и доходность рассчитаны автоматически по текущим или резервным данным.</div>
        </section>

        <section className="panel">
          <h2>{scenario.title}</h2>
          <p className="muted">{scenario.description}</p>
          <div className="chips"><span>Средняя доходность: {percent(liveYield)}</span><span>Бумаг: {scenario.bonds.length}</span></div>
          <div className="bond-grid">
            {scenario.bonds.map((bond) => {
              const q = quotes[bond.name];
              const item = plan.allocation.find((row) => row.name === bond.name);
              return <article key={bond.name} className="bond"><h3>{bond.name}</h3><p>ISIN: {bond.secid || q?.secid || '—'}</p><p>{bond.term}</p>{q?.maturityDate ? <p>Погашение: {new Date(q.maturityDate).toLocaleDateString('ru-RU')}</p> : null}<div><span>Цена</span><strong>{price(q?.price || item?.price)}</strong></div><div><span>Доходность</span><strong>{percent(q?.yield)}</strong></div><div><span>Купон</span><strong>{price(q?.couponValue || item?.couponValue)}</strong></div><div><span>Купить</span><strong>{item?.quantity?.toLocaleString('ru-RU') || 0} шт.</strong></div></article>;
            })}
          </div>

          <div className="risk-note">
            <strong>Важно про срок жизни облигаций</strong>
            <p>{scenarioTermComment(scenario, years)}</p>
            <p>Подборки и расчёты в калькуляторе приведены только для самостоятельного анализа и не являются индивидуальной инвестиционной рекомендацией.</p>
          </div>
        </section>
      </section>

      <section className="summary"><strong>Комментарий к расчёту</strong><br />Чтобы получать <strong>{money(targetMonthlyIncome)} в месяц</strong>, расчёт балансирует количество облигаций так, чтобы сумма вложений в каждую бумагу была примерно одинаковой. При сценарии «{scenario.title}» нужно вложить около <strong>{money(plan.targetCapital)}</strong>. Это ориентировочная модель: фактические цены, доходности и доступные выпуски могут измениться.<br /><strong>Расчёты проведены.</strong></section>

      <section className="content-grid">
        <section className="panel"><h2>Рост капитала по годам</h2><p className="muted">Слева размер капитала, снизу срок инвестирования.</p><MiniChart data={growth.data} /></section>
        <section className="panel"><h2>Календарь выплат купонов</h2><p className="muted">Ближайшие выплаты выбранной подборки на 12 месяцев.</p><div className="calendar">{calendar.map((month) => <div key={month.key} className="month"><header><strong>{month.month} {month.year}</strong><span>{price(month.total)}</span></header>{month.payments.map((p) => <div key={`${p.name}-${p.date}`} className="payment"><span>{p.date}</span><strong>{p.name}</strong><em>{price(p.total)} <small>({p.quantity} шт.)</small></em></div>)}</div>)}</div></section>
      </section>

      <div className="test-badge">{testsPassed ? 'Расчёты проведены. Проверка расчётов пройдена' : 'Расчёты проведены. Проверьте исходные данные'}</div>
      <footer>Здесь канал для тех, кто стремится получать и увеличивать свой пассивный доход.<br />👉 <a href="https://t.me/passive_dohod_bot" target="_blank" rel="noreferrer">Система пассивного дохода</a></footer>
    </main>
  );
}
