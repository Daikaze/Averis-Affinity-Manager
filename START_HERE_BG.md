## v0.4.0 — Special Affinities

- **22 Affinities:** 12 Normal и 10 Special: Blood, Time, Space, Gravity, Soul, Dream, Void, Chaos, Fate, Metal.
- **Thunder е премахнат.** Общо **110 умения** на 5 нива и 110 отделни SVG иконки.
- Всеки играч вижда **само отключените от GM Affinities на своя Actor**. Не вижда имената и способностите на неотключените. GM вижда цялата категория Special.
- Запазени са стари нива, способности, cooldown и ръчно изтрити Features. Направи backup на света преди update.
- Скриването е в интерфейса; кодът на инсталираните модули може да бъде прочетен чрез Developer Tools.
- Manifest: https://raw.githubusercontent.com/Daikaze/Averis-Affinity-Manager/main/module.json

## v0.3.2 — D&D 5e 6.0.6 / Foundry v14

- Съвместимост: **Foundry VTT v14 (build 14.367+)** и **D&D 5e 6.0.6**.
- Запазени са всички 65 Affinity способности и иконките им, progress на героите, GM DC проверките и cooldown системата.
- Поправено е **Use / Share**: ако излезеш от Activity, без да го изпълниш, не се отчита използване.
- В стандартния Character Sheet Affinity остава собствен таб. За Tidy е нужна версия на Tidy, която поддържа D&D 5e 6.x.
- Направи backup на света, обнови модула и презареди Foundry. Провери един герой с GM и Player профил.
- Manifest: https://raw.githubusercontent.com/Daikaze/Averis-Affinity-Manager/main/module.json

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

**Оригинална съвместимост на v0.3.0:** V14 / D&D 5e 5.3.3.

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

## v0.5.0 — Creative Energy и NPC Affinities

- **Creative Energy е отделна** от готовите Affinity Spells и Features. Готовите способности НЕ харчат Creative Energy.
- Максимална Energy = PB на Actor; Short Rest +1, Long Rest възстановява всичко. Споделен ресурс за всички Affinities.
- GM определя цената (1–6 Energy) за импровизирани homebrew действия. В таб **Creative Energy** играчът избира режим и записва действието; цената и описанието се записват в чата.
- Forced Activation: използва се при недостиг, максимум 3 Strain. Empowered Overload: при платена нормална цена, добавя 1 Strain. Общо 1 Overload / Long Rest. CON Save DC 10+2×Strain; при успех Strain d6 Force, при провал 2×Strain d6 Force и Burnout. GM прилага HP щетата и изчиства Burnout след следващия ход.
- NPC: GM отваря **Alt+A**, избира NPC Actor, натиска **Assign NPC Affinity** и задава Level 1–5. Способностите се синхронизират към Actor като Features; NPC няма нужда от training checks. GM може да задава и ръчен максимален Energy.
- Ако използваш NPC от различна сцена, работи със световния Actor от Actors Directory; за linked Token промените ще се виждат.
