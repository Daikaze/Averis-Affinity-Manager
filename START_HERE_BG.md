## v0.3.1 — Иконки в Character Sheet → Features

Всяка Affinity способност от Level 1 до Level 5 получава собствена цветна иконка. Общо **65 SVG иконки** за 13 Affinities.

- Новите Features получават правилната иконка автоматично при отключване.
- Стари Features със стандартна иконка `aura.svg` се обновяват автоматично, когато GM отвори Affinity таба за този герой.
- **Иконки, които си сменил ръчно, не се презаписват.**
- Ако си изтрил Feature ръчно, той няма да се появява отново.
- Действията, нивата и записаните умения остават непроменени.

# Averis Affinity Manager v0.3.0 — ТАБ В CHARACTER SHEET

Вече отваряш **Affinity** като самостоятелен таб до Features / Spellbook / Inventory в Character Sheet.

- **Tidy 5e:** директен таб чрез официалния Tidy API. Ако имаш custom избор на табове, в Tidy Sheet Settings включи Affinity.
- **Стандартен D&D 5e sheet:** нов Affinity таб до Features.
- Вътре остават всички действия: Abilities, Training, History, Learn, Remove, GM Rolls, Level, Cooldown, Use/Share, Restore Features.
- Играчът вижда само собствения герой. Числовите DC и GM бутоните са само за GM.
- Отваряне от менюто с трите точки вече не е необходимо. Alt+A е оставено само като резервен вариант.
- Прогресията от предишните версии се запазва.

**Foundry:** V14 / D&D 5e 5.3.3.

**Manifest:** https://raw.githubusercontent.com/Daikaze/Averis-Affinity-Manager/main/module.json

Направи backup на света преди обновяване и презареди клиента с Ctrl+F5.

# Averis Affinity Manager v0.1.1 — инструкции

- Foundry VTT V14; D&D 5e 5.3.3. Направи backup на света.
- Install Module → Manifest URL:
  https://raw.githubusercontent.com/Daikaze/Averis-Affinity-Manager/main/module.json
- Влез в Averis, активирай модула и отвори персонаж. Отгоре има **Affinity Manager**, или Alt+A.
- GM: избери герой и Affinity, после **Grant innate**, **Learn from teacher** или **Grant special** (Blood).
- За учене от друго същество то трябва да владее същия Affinity на Level 5. GM може да го маркира като Lv5 учител.
- На всяко Level се правят три успешни проверки: Constitution, Arcana, Insight. DC са скрити от интерфейса на играчите и се показват само на GM. Запазват се вече успешните проверки.
- След провал: 3 дни cooldown; след Level-up: 7 дни, според игровото време. Променят се в Module Settings.
- Пълните 65 способности са от изпратения текст. При Thunder няма предоставени правила и затова е заключен placeholder.
- Играчите могат да преглеждат откритите способности и да отбелязват използвания. Автоматично изчисляване на щети, Saving Throws и комплексни ефекти не е включено, за да не дублира нормалните D&D механики.
- След Long Rest натисни **Reset Affinity Uses (Long Rest)**.
- DC числата се крият от UI и общия чат, но *модулен код може да бъде прочетен от любопитен играч*; това не е криптографска защита.