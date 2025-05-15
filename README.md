# Islamic Inheritance Calculator


**NB:** This is a work in progress. If you spot an error in the calculations, please [file an issue](https://github.com/your-repo-link/issues).

This package calculates Islamic inheritance shares based on the Sunni schools of jurisprudence. Currently supports madhhab-specific logic (e.g. **Hanafi**, **Shafi'i**).

---

## 📦 Installation

```bash
npm install webevis-inheritance-calculator
```

---

## 🚀 Usage

```ts
import { calculate } from 'webevis-inheritance-calculator'
import Fraction from 'fraction.js'

function printResults(results) {
  const fractionToString = (r) => ({ ...r, share: r.share.toFraction(true) })
  console.log(results.map(fractionToString))
}

const result = calculate({ wife: 3, son: 1, daughter: 1 }, 'hanafi')

printResults(result)
// [
//   { name: 'wife',     count: 3, type: 'fard',  share: '1/8'  },
//   { name: 'son',      count: 1, type: 'tasib', share: '7/12' },
//   { name: 'daughter', count: 1, type: 'tasib', share: '7/24' }
// ]
```

### 🧮 Parameters

- `heirs: Record<string, number>` – A key-value object of heir names and their counts.
- `madhhab: 'hanafi' | 'shafii' | 'maliki' | 'hanbali'` *(optional, default: 'hanafi')*

---

## ⚖ Supported Features

- ✅ Fard (obligatory) shares
- ✅ Taʿṣīb (residuary) shares
- ✅ Blocking (ḥajb) logic
- ✅ Awl (reduction when shares exceed estate)
- ✅ Radd (redistribution when shares are less than 1)
- ✅ Multiple wives (shared 1/8)
- ✅ Madhhab-specific differences (e.g. grandfather with siblings)

---

## 🧪 Testing

Run all test cases using:

```bash
npm test
```




## 📬 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📜 License

MIT License © Webevis