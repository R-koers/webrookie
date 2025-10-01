# VexaParts 💻

VexaParts is een minimalistische en overzichtelijke webshop waar je pc-onderdelen kunt bekijken en in een winkelwagen plaatsen. Daarnaast is er een admin-paneel waar producten beheerd kunnen worden.  

## 🌐 Live Demo
- **Webshop:** [https://vexaparts.netlify.app/](https://vexaparts.netlify.app/)  
- **Admin:** [https://vexaparts.netlify.app/admin.html](https://vexaparts.netlify.app/admin.html)  

---

## ⚡ Functionaliteiten

### Voor klanten
- Productoverzicht met **filters, sortering en zoekfunctie**  
- **Product detailpagina** met technische info  
- **Winkelwagen** met toevoegen/verwijderen/quantity  
- **Checkout** met formulier-validatie en orderbevestiging  
- Data-opslag in **LocalStorage**  

### Voor admins
- **CRUD** functionaliteit: producten toevoegen, bewerken, verwijderen  
- **Reset** naar originele productdatabase  
- Alle wijzigingen opgeslagen in **LocalStorage**  

---

## 📂 Projectstructuur
```text
public/
├── index.html # Homepage
├── parts.html # Producten overzicht
├── product.html # Product detail
├── checkout.html # Afrekenen
├── admin.html # Admin panel
├── products.json # Product database
├── js/
│ ├── app.js # Carousel & navigatie
│ ├── products.js # Product functionaliteit
│ ├── cart.js # Winkelwagen
│ ├── product-detail.js
│ ├── checkout.js # Checkout & validatie
│ └── admin.js # Admin functies
├── src/output.css # Tailwind CSS
└── images/ # Afbeeldingen
```

---

## 🚀 Installatie

### Methode 1: Lokaal openen
1. Clone de repo  
2. Open `public/index.html` in je browser  

### Methode 2: Online bekijken
Gebruik de live link:  
- [Webshop](https://vexaparts.netlify.app/)  
- [Admin](https://vexaparts.netlify.app/admin.html)  

---

## ✅ Wat werkt er?
- Responsive design (desktop & mobiel)  
- Carousel & best-sellers sectie  
- Product filtering, sortering en zoekfunctie  
- Product detailpagina’s  
- Volledig winkelwagensysteem met LocalStorage  
- Checkout proces met validatie  
- Admin panel voor productbeheer  

---

## 🛠️ Troubleshooting
- **Producten laden niet** → check of `products.json` bestaat  
- **Winkelwagen leeg** → clear LocalStorage en refresh  
- **Stijl klopt niet** → check of Tailwind CSS geladen is  
- Check browser console (F12) voor errors   