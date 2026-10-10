#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
# Genera ../golden_set_foods.sql a partire da una struttura dati unica
# (questo dict), per evitare errori di trascrizione nello scrivere ~150
# righe INSERT a mano. Ogni valore qui dentro e' stato letto da Claude
# direttamente dalle pagine USDA FoodData Central (endpoint
# fdc.nal.usda.gov/portal-data/external/<FDC_ID>, usato perche' le pagine
# food-details/*/nutrients sono una SPA Angular non fetchable direttamente
# in quell'ambiente) il 2026-10-09, o da una fonte di letteratura
# specifica (ossalati/fitati) citata per campo -- vedi golden_set_foods.sql
# per le citazioni complete e i gap dichiarati.
#
# NESSUN valore qui e' stimato o interpolato: dove un campo non era
# presente nella fonte, e' semplicemente assente dal dict (-> riga non
# generata), non impostato a 0 o a un "tipico".
#
# Uso: python3 generate_golden_set_foods.py
# (rigenera ../golden_set_foods.sql da questo file; se aggiungi un nuovo
# alimento al Golden Set, aggiungilo a FOODS qui sotto, non direttamente
# nel file .sql, cosi' il dict resta la fonte di verita' unica.)
#
# AGGIORNAMENTO 2026-10-10: aggiunti i macronutrienti (energy_kcal,
# protein_g, fat_g, carbohydrates_g, fiber_g) richiesti esplicitamente
# dall'utente. fdc.nal.usda.gov non era raggiungibile direttamente in
# questa sessione (pagina SPA Angular + un endpoint alternativo che ha
# richiesto un permesso non concedibile in autonomia) -- i valori sono
# stati letti da getfoodfacts.com, un mirror che cita esplicitamente lo
# stesso FDC ID per ogni record, verificato riga per riga PRIMA di
# accettare i numeri (non un record "simile" di altra cultivar/prep.).
# Per gli alimenti di origine animale, fiber_g=0.0 è un valore dichiarato
# esplicitamente dalla fonte per quello specifico FDC ID, non
# un'assunzione biologica non verificata.
#
# AGGIORNAMENTO 2026-10-10 (secondo giro): fusi dentro FOODS anche
#   (a) baseline_cooking_state per tutti i 20 alimenti già presenti,
#       backfillato da fix_baseline_cooking_state.sql -- registra lo stato
#       di cottura REALE del valore salvato (vedi commento sulla colonna
#       stessa in quel file: 'raw' è l'unico stato da cui
#       CookingTransformationEngine può applicare in sicurezza un fattore
#       di ritenzione; qualunque altro valore blocca il selettore in UI
#       per evitare uno sconto doppio su un dato già cotto). Correzione
#       inclusa qui: food_oranges_raw era rimasto 'unknown' per una svista
#       nel backfill originale (19 righe aggiornate su 20 alimenti) --
#       ora 'raw', coerente con l'FDC "Oranges, raw, all commercial
#       varieties".
#   (b) i 9 nuovi alimenti crudi di golden_set_raw_baselines.sql (patate,
#       fagioli rossi, lenticchie, ceci, fegato di manzo, manzo macinato,
#       uova, salmone, pasta secca arricchita) -- baseline reale per le 7
#       matrici che avevano SOLO un valore già cotto salvato, nessun punto
#       di partenza da cui applicare i fattori di ritenzione di cottura.
#       food_lentils_raw sostituisce qui una vecchia riga cruft con fonti
#       NULL (stesso food_id, già rimossa dal DB live in
#       golden_set_raw_baselines.sql insieme al suo food_id gemello).
#
# AGGIORNAMENTO 2026-10-10 (terzo giro): fusa anche la struttura
# RETENTION_FACTORS (vedi sotto, dopo SOURCES_NEW) -- 23 fattori di
# ritenzione di cottura, prima sparsi su 4 file (retention_factors_
# legumi_tuberi.sql, retention_factors_crucifere.sql,
# retention_factors_padella.sql, fix_sources_e_retention_factors.sql) più
# il fattore latte di golden_set_raw_baselines.sql. Durante questa fusione
# un controllo incrociato contro il DB live ha trovato 4 righe senza fonte
# (source_id NULL) mai presenti in nessun file versionato -- tra cui una
# (leafy_greens/boiled/vitamin_c) in conflitto diretto col valore dichiarato
# in fix_sources_e_retention_factors.sql (0.50 senza fonte sul DB live
# contro 0.58/USDA_RETN06 nel file). Confermato con l'utente come cruft non
# suo, non un'edit intenzionale. Le 4 righe sono dettagliate nel commento
# sopra RETENTION_FACTORS; questo generatore corregge quella con un
# sostituto sourced (leafy_greens/boiled/vitamin_c) tramite l'ON CONFLICT DO
# UPDATE già in uso, le altre 3 non hanno sostituto e vanno solo rimosse
# (DELETE eseguito a parte, non in questo script).
#
# AGGIORNAMENTO 2026-10-10 (quarto giro): verificato uno per uno, contro il
# DB live, lo stato dei 5 file elencati come "debito" qui sotto (approvato
# dall'utente con "procedi"). Risultato: NESSUNO dei 5 e' in sospeso --
# sono tutti gia' stati eseguiti live, con una sola eccezione corretta in
# questo giro:
#   - admin_data_entry_setup.sql: applicato (get_enum_values() esiste,
#     retention_factors.confidence_low/high e foods_raw.botanical_family
#     gia' presenti).
#   - extend_cooking_method_enum.sql: applicato (implicito: le righe
#     RETENTION_FACTORS con cooking_method='boiled_quick_15_20min' e
#     'boiled_in_skin' sono inserite con successo sul DB live, impossibile
#     se l'enum non avesse questi valori).
#   - cleanup_is_heme_iron_cruft.sql: applicato (0 righe
#     nutrient_code='is_heme_iron' rimaste).
#   - cleanup_chickpeas_raw_cruft.sql: applicato (vedi terzo giro sopra).
#   - golden_set_promote_verified.sql: applicato per 19 dei 20 alimenti al
#     primo giro -- food_oranges_raw.verification_status era rimasto
#     'draft' su foods_raw (causa non accertata: probabile esecuzione del
#     file precedente all'inserimento/ultima reinsert di quella riga
#     specifica). Completato il 2026-10-10 con fix_oranges_promote_verified.sql
#     (UPDATE eseguito a parte, non in questo script, dopo approvazione
#     esplicita dell'utente -- un primo tentativo era stato negato dal
#     sistema di permessi della sessione come scrittura su risorsa di
#     produzione) -- ora 20/20 alimenti promossi. Le righe nutrient_values
#     di oranges restano correttamente miste (verified per i campi
#     cross-checkati nel 2026-10-09, draft per i 5 macronutrienti aggiunti
#     SOLO il 2026-10-10, mai passati da quel cross-check: draft e' lo
#     stato corretto per quelli, non un'anomalia).
#
# Questi 5 file restano VOLUTAMENTE fuori da questo generatore, non per
# debito da ripagare ma per differenza di natura: generate_golden_set_foods.py
# produce righe di DATI (foods_raw/nutrient_values/retention_factors) in
# modo idempotente e ripetibile; i 5 file sono invece (a) migrazioni di
# schema one-shot (extend_cooking_method_enum.sql, admin_data_entry_setup.sql),
# (b) pulizie di cruft legacy one-shot ormai concluse (cleanup_is_heme_iron_
# cruft.sql, cleanup_chickpeas_raw_cruft.sql), o (c) una promozione umana
# esplicita draft->verified che per design (vedi PRD §4.6, "Human-in-the-
# Loop") NON deve MAI essere un default automatico o rieseguita ad ogni
# rigenerazione -- fonderla qui dentro violerebbe quel principio, non lo
# rispetterebbe. Restano quindi come file SQL singoli, gia' eseguiti ed
# eseguiti una sola volta, tenuti per la cronologia/trasparenza.
#
# Questo script genera SOLO golden_set_foods.sql (foods_raw +
# nutrient_values + retention_factors del Golden Set), non l'intero stato
# del DB.

import os

FOODS = [
    {
        "food_id": "food_spinach_raw",
        "name_it": "Spinaci, crudi",
        "matrix_id": "leafy_greens",
        "baseline_cooking_state": "raw",
        "is_heme_iron": False,
        "matrix_category_calcium": "high_oxalate",
        "botanical_family": "Amaranthaceae",
        "fdc_id": 168462,
        "fdc_name": "Spinach, raw",
        "values": {
            "iron_mg": 2.71, "zinc_mg": 0.53, "calcium_mg": 99, "vitamin_c_mg": 28.1,
            "magnesium_mg": 79.0, "copper_mg": 0.130, "selenium_mcg": 1.0,
            "vitamin_k_mcg": 483, "vitamin_b12_mcg": 0.00, "folate_mcg": 194,
            "beta_carotene_mcg": 5630, "other_provitamin_a_carotenoids_mcg": 0,  # alpha=0, crypto=0
            "energy_kcal": 23.0, "protein_g": 2.86, "fat_g": 0.39, "carbohydrates_g": 3.63, "fiber_g": 2.20,
        },
        "extra": {
            # Ossalati: DECISIONE PRESA 2026-10-10 (vedi
            # fix_literature_sources_recheck.sql per il dettaglio completo).
            # Due fonti discordanti: Noonan & Savage 1999 (review, media
            # 970 mg/100g sintetizzata da altre 3 fonti, usata qui fino al
            # 2026-10-10) vs Siener et al. 2006 (studio primario dedicato
            # sulla famiglia botanica degli spinaci, 1959 mg/100g totale).
            # L'utente ha scelto esplicitamente la fonte piu' recente E piu'
            # "di prima mano" (studio primario vs review di sintesi) ->
            # Siener. Nessun confidence_low/high: nessuna delle fonti
            # disponibili riporta un range per questo singolo valore.
            # verification_status resta 'draft' nonostante il cambio: il
            # testo completo di Siener 2006 e' a pagamento (ScienceDirect),
            # non letto direttamente da Claude -- il numero e' di seconda
            # mano (dalla nota che era gia' nel PRD), non confermato di
            # persona come per kale/fagioli sotto.
            "oxalates_mg": {"value": 1959, "confidence_low": None, "confidence_high": None, "source_id": "SIENER_2006_FOODCHEM"},
        }
    },
    {
        "food_id": "food_spinach_boiled",
        "name_it": "Spinaci, bolliti e scolati",
        "matrix_id": "leafy_greens",
        "baseline_cooking_state": "boiled",
        "is_heme_iron": False,
        "matrix_category_calcium": "high_oxalate",
        "botanical_family": "Amaranthaceae",
        "fdc_id": 168463,
        "fdc_name": "Spinach, cooked, boiled, drained, without salt",
        "values": {
            "iron_mg": 3.57, "zinc_mg": 0.76, "calcium_mg": 136, "vitamin_c_mg": 9.8,
            "magnesium_mg": 87.0, "copper_mg": 0.174, "selenium_mcg": 1.5,
            "vitamin_k_mcg": 494, "vitamin_b12_mcg": 0.00, "folate_mcg": 146,
            "beta_carotene_mcg": 6290, "other_provitamin_a_carotenoids_mcg": 0,
            "energy_kcal": 23.0, "protein_g": 2.97, "fat_g": 0.26, "carbohydrates_g": 3.75, "fiber_g": 2.40,
        },
    },
    {
        "food_id": "food_kale_raw",
        "name_it": "Cavolo kale, crudo",
        "matrix_id": "leafy_greens",
        "baseline_cooking_state": "raw",
        "is_heme_iron": False,
        "matrix_category_calcium": "low_oxalate",
        "botanical_family": "Brassicaceae",
        "fdc_id": 323505,
        "fdc_name": "Kale, raw",
        "values": {
            # selenium/vitamin_k/vitamin_b12 NON recuperati (JSON troncato
            # durante il fetch in questa sessione, non assenti per certo
            # dalla fonte) -- lasciati fuori, non impostati a NOT_FOUND/0.
            "iron_mg": 1.60, "zinc_mg": 0.39, "calcium_mg": 254, "vitamin_c_mg": 93.4,
            "magnesium_mg": 32.7, "copper_mg": 0.053, "folate_mcg": 62,
            "beta_carotene_mcg": 2870, "other_provitamin_a_carotenoids_mcg": 27,  # alpha=0, crypto=27
            "energy_kcal": 35.0, "protein_g": 2.92, "fat_g": 1.49, "carbohydrates_g": 4.42, "fiber_g": 4.10,
        },
        "extra": {
            "oxalates_mg": {"value": 297, "confidence_low": 229.8, "confidence_high": 364.2, "source_id": "ERDOGAN_ONAR_2012_JFDA"},
        }
    },
    {
        "food_id": "food_milk_whole",
        "name_it": "Latte vaccino intero (3.25% grassi, vitamina D aggiunta)",
        "matrix_id": "dairy_milk",
        "baseline_cooking_state": "raw",
        "is_heme_iron": False,
        "matrix_category_calcium": "medium_oxalate",
        "botanical_family": None,
        "fdc_id": 322892,
        "fdc_name": "Milk, whole, 3.25% milkfat, with added vitamin D",
        "values": {
            # SOLO il calcio e' stato confermato leggendo il JSON in questa
            # sessione (il record e' molto verboso, oltre 81000 caratteri,
            # e il fetch si e' troncato prima dei minerali successivi al
            # calcio anche a offset diversi) -- tutti gli altri campi
            # restano assenti per onestà, non impostati a NOT_FOUND/0.
            "calcium_mg": 123,
            # Macronutrienti aggiunti 2026-10-10 (fonte verificata separatamente,
            # stesso FDC ID 322892). fiber_g ASSENTE DI PROPOSITO: la fonte
            # verificata per questo stesso FDC ID è internamente contraddittoria
            # sulla fibra (etichetta "not declared" / riquadro "0g" / nessuna riga
            # "Fiber" nella tabella nutrienti completa) -- non si assume 0 senza
            # una dichiarazione esplicita, anche se biologicamente plausibile.
            "energy_kcal": 60.0, "protein_g": 3.28, "fat_g": 3.20, "carbohydrates_g": 4.67,
        },
    },
    {
        "food_id": "food_kidney_beans_boiled",
        "name_it": "Fagioli rossi (kidney), bolliti",
        "matrix_id": "legumes",
        "baseline_cooking_state": "boiled",
        "is_heme_iron": False,
        "matrix_category_calcium": None,
        "botanical_family": "Fabaceae",
        "fdc_id": 175194,
        "fdc_name": "Beans, kidney, red, mature seeds, cooked, boiled, without salt",
        "values": {
            "iron_mg": 2.94, "zinc_mg": 1.07, "calcium_mg": 28, "vitamin_c_mg": 1.2,
            "magnesium_mg": 45.0, "copper_mg": 0.242, "selenium_mcg": 1.2,
            "vitamin_k_mcg": 8.4, "vitamin_b12_mcg": 0.00, "folate_mcg": 130,
            "energy_kcal": 127, "protein_g": 8.67, "fat_g": 0.50, "carbohydrates_g": 22.8, "fiber_g": 7.40,
        },
        "extra": {
            "phytates_mg": {"value": 805, "confidence_low": None, "confidence_high": None, "source_id": "ZIA_UR_REHMAN_2002_PJSIR"},
        }
    },
    {
        "food_id": "food_lentils_boiled",
        "name_it": "Lenticchie, bollite",
        "matrix_id": "legumes",
        "baseline_cooking_state": "boiled",
        "is_heme_iron": False,
        "matrix_category_calcium": None,
        "botanical_family": "Fabaceae",
        "fdc_id": 172421,
        "fdc_name": "Lentils, mature seeds, cooked, boiled, without salt",
        "values": {
            "iron_mg": 3.33, "zinc_mg": 1.27, "calcium_mg": 19, "vitamin_c_mg": 1.5,
            "magnesium_mg": 36.0, "copper_mg": 0.251, "selenium_mcg": 2.8,
            "vitamin_k_mcg": 1.7, "vitamin_b12_mcg": 0.00, "folate_mcg": 181,
            "energy_kcal": 116, "protein_g": 9.02, "fat_g": 0.38, "carbohydrates_g": 20.1, "fiber_g": 7.90,
        },
        # Fitati: trovato SOLO per lenticchie crude/secche (233.04 mg/100g,
        # Fouad & Rehab 2015), non per lenticchie bollite -- stato
        # mismatch col food_id di questa riga (bollite). NON inserito qui
        # per non attribuire un valore "crudo" a un alimento "bollito".
        # Vedi commento SQL.
    },
    {
        "food_id": "food_potato_boiled_in_skin",
        "name_it": "Patate, bollite con la buccia",
        "matrix_id": "tubers",
        "baseline_cooking_state": "boiled_in_skin",
        "is_heme_iron": False,
        "matrix_category_calcium": None,
        "botanical_family": "Solanaceae",
        "fdc_id": 170438,
        "fdc_name": "Potatoes, boiled, cooked in skin, flesh, without salt",
        "values": {
            "iron_mg": 0.31, "zinc_mg": 0.30, "calcium_mg": 5, "vitamin_c_mg": 13.0,
            "magnesium_mg": 22.0, "copper_mg": 0.188, "selenium_mcg": 0.3,
            "vitamin_k_mcg": 2.2, "vitamin_b12_mcg": 0.00, "folate_mcg": 10,
            "beta_carotene_mcg": 2, "other_provitamin_a_carotenoids_mcg": 0,
            "energy_kcal": 87.0, "protein_g": 1.87, "fat_g": 0.10, "carbohydrates_g": 20.1, "fiber_g": 1.80,
        },
    },
    {
        "food_id": "food_carrots_raw",
        "name_it": "Carote, crude",
        "matrix_id": "carrots",
        "baseline_cooking_state": "raw",
        "is_heme_iron": False,
        "matrix_category_calcium": None,
        "botanical_family": "Apiaceae",
        "carotenoid_matrix_state": "raw_intact",
        "fdc_id": 170393,
        "fdc_name": "Carrots, raw",
        "values": {
            "iron_mg": 0.30, "zinc_mg": 0.24, "calcium_mg": 33, "vitamin_c_mg": 5.9,
            "magnesium_mg": 12.0, "copper_mg": 0.045, "selenium_mcg": 0.1,
            "vitamin_k_mcg": 13.2, "vitamin_b12_mcg": 0.00, "folate_mcg": 19,
            "beta_carotene_mcg": 8280, "other_provitamin_a_carotenoids_mcg": 3480,  # alpha=3480, crypto=0
            "energy_kcal": 41.0, "protein_g": 0.93, "fat_g": 0.24, "carbohydrates_g": 9.58, "fiber_g": 2.80,
        },
    },
    {
        "food_id": "food_carrots_boiled",
        "name_it": "Carote, bollite e scolate",
        "matrix_id": "carrots",
        "baseline_cooking_state": "boiled",
        "is_heme_iron": False,
        "matrix_category_calcium": None,
        "botanical_family": "Apiaceae",
        "carotenoid_matrix_state": "cooked_or_disrupted",
        "fdc_id": 170394,
        "fdc_name": "Carrots, cooked, boiled, drained, without salt",
        "values": {
            "iron_mg": 0.34, "zinc_mg": 0.20, "calcium_mg": 30, "vitamin_c_mg": 3.6,
            "magnesium_mg": 10.0, "copper_mg": 0.017, "selenium_mcg": 0.7,
            "vitamin_k_mcg": 13.7, "vitamin_b12_mcg": 0.00, "folate_mcg": 14,
            "beta_carotene_mcg": 8330, "other_provitamin_a_carotenoids_mcg": 3780,  # alpha=3780, crypto=0
            "energy_kcal": 35.0, "protein_g": 0.76, "fat_g": 0.18, "carbohydrates_g": 8.22, "fiber_g": 3.00,
        },
    },
    {
        "food_id": "food_brussels_sprouts_raw",
        "name_it": "Cavoletti di Bruxelles, crudi",
        "matrix_id": "crucifere_cavoletti_bruxelles",
        "baseline_cooking_state": "raw",
        "is_heme_iron": False,
        "matrix_category_calcium": None,
        "botanical_family": "Brassicaceae",
        "zinc_bioaccessibility_bucket": "none",
        "fdc_id": 170383,
        "fdc_name": "Brussels sprouts, raw",
        "values": {
            "iron_mg": 1.40, "zinc_mg": 0.42, "calcium_mg": 42, "vitamin_c_mg": 85.0,
            "magnesium_mg": 23.0, "copper_mg": 0.070, "selenium_mcg": 1.6,
            "vitamin_k_mcg": 177, "vitamin_b12_mcg": 0.00, "folate_mcg": 61,
            "beta_carotene_mcg": 450, "other_provitamin_a_carotenoids_mcg": 6,  # alpha=6, crypto=0
            "energy_kcal": 43.0, "protein_g": 3.38, "fat_g": 0.30, "carbohydrates_g": 8.95, "fiber_g": 3.80,
        },
    },
    {
        "food_id": "food_brussels_sprouts_boiled",
        "name_it": "Cavoletti di Bruxelles, bolliti e scolati",
        "matrix_id": "crucifere_cavoletti_bruxelles",
        "baseline_cooking_state": "boiled",
        "is_heme_iron": False,
        "matrix_category_calcium": None,
        "botanical_family": "Brassicaceae",
        "zinc_bioaccessibility_bucket": "brussels_sprouts_boiled",
        "fdc_id": 169971,
        "fdc_name": "Brussels sprouts, cooked, boiled, drained, without salt",
        "values": {
            # Carotenoidi non richiesti/recuperati per questa voce in
            # questa sessione (non centrali al modello bioaccessibilita'
            # zinco) -- assenti, non stimati.
            "iron_mg": 1.20, "zinc_mg": 0.33, "calcium_mg": 36, "vitamin_c_mg": 62.0,
            "magnesium_mg": 20.0, "copper_mg": 0.083, "selenium_mcg": 1.5,
            "vitamin_k_mcg": 140, "vitamin_b12_mcg": 0.00, "folate_mcg": 60,
            "energy_kcal": 36.0, "protein_g": 2.55, "fat_g": 0.50, "carbohydrates_g": 7.10, "fiber_g": 2.60,
        },
    },
    {
        "food_id": "food_beef_liver_cooked",
        "name_it": "Fegato di manzo, cotto (brasato)",
        "matrix_id": "beef_liver",
        "baseline_cooking_state": "braised",
        "is_heme_iron": True,
        "matrix_category_calcium": None,
        "botanical_family": None,
        "fdc_id": 168626,
        "fdc_name": "Beef, variety meats and by-products, liver, cooked, braised",
        "values": {
            "iron_mg": 6.54, "zinc_mg": 5.30, "calcium_mg": 6, "vitamin_c_mg": 1.9,
            "magnesium_mg": 21.0, "copper_mg": 14.3, "selenium_mcg": 36.1,
            "vitamin_k_mcg": 3.3, "vitamin_b12_mcg": 70.6, "folate_mcg": 253,
            # beta-carotene minore (162 mcg) presente nel record FDC, ma il
            # grosso della vitamina A del fegato e' retinolo preformato
            # (9440 mcg RAE, non modellato dall'app -- limite dichiarato
            # preesistente in calculateVitaminARAE). Inserito comunque il
            # dato reale di beta-carotene, senza inventare un retinolo.
            "beta_carotene_mcg": 162,
            "energy_kcal": 191, "protein_g": 29.1, "fat_g": 5.26, "carbohydrates_g": 5.13, "fiber_g": 0.0,
        },
    },
    {
        "food_id": "food_beef_ground_cooked",
        "name_it": "Manzo macinato (85% magro), cotto alla griglia",
        "matrix_id": "beef_ground_meat",
        "baseline_cooking_state": "grilled",
        "is_heme_iron": True,
        "matrix_category_calcium": None,
        "botanical_family": None,
        "fdc_id": 174032,
        "fdc_name": "Beef, ground, 85% lean meat / 15% fat, patty, cooked, broiled",
        "values": {
            "iron_mg": 2.60, "zinc_mg": 6.31, "calcium_mg": 18, "vitamin_c_mg": 0.0,
            "magnesium_mg": 21.0, "copper_mg": 0.085, "selenium_mcg": 21.5,
            "vitamin_k_mcg": 1.2, "vitamin_b12_mcg": 2.64, "folate_mcg": 9,
            "energy_kcal": 250, "protein_g": 25.9, "fat_g": 15.4, "carbohydrates_g": 0.0, "fiber_g": 0.0,
        },
    },
    {
        # Controparte "cotta" (FDC 169967): vedi food_broccoli_boiled poco
        # sotto. Il selettore "Cottura" in UI applica il fattore di
        # ritenzione DERIVATO dal rapporto fra questa riga e quella --
        # vedi RETENTION_FACTORS/DERIVED_FDC_RAW_COOKED_RATIO. La riga
        # food_broccoli_boiled stessa resta draft/non promossa: serve solo
        # da base di calcolo, non va mostrata come alimento separato.
        "food_id": "food_broccoli_raw",
        "name_it": "Broccoli, crudi",
        "matrix_id": "broccoli",
        "baseline_cooking_state": "raw",
        "is_heme_iron": False,
        "matrix_category_calcium": None,
        "botanical_family": "Brassicaceae",
        "carotenoid_matrix_state": "raw_intact",
        "fdc_id": 170379,
        "fdc_name": "Broccoli, raw",
        "values": {
            "iron_mg": 0.73, "zinc_mg": 0.41, "calcium_mg": 47, "vitamin_c_mg": 89.2,
            "magnesium_mg": 21.0, "copper_mg": 0.049, "selenium_mcg": 2.5,
            "vitamin_k_mcg": 102, "vitamin_b12_mcg": 0.00, "folate_mcg": 63,
            "beta_carotene_mcg": 361, "other_provitamin_a_carotenoids_mcg": 26,  # alpha=25, crypto=1
            "energy_kcal": 34.0, "protein_g": 2.82, "fat_g": 0.37, "carbohydrates_g": 6.64, "fiber_g": 2.60,
        },
    },
    {
        # Controparte "cotta" di food_broccoli_raw. FDC ID 169967, confermato
        # FRESCO (non surgelato): il nome del record non contiene "frozen",
        # a differenza delle voci surgelate che lo dichiarano esplicitamente
        # nel nome -- letto direttamente dal JSON
        # fdc.nal.usda.gov/portal-data/external/169967.
        #
        # AGGIORNAMENTO 2026-10-10 (quarto giro): questa riga ora serve SOLO
        # da base di calcolo per il fattore di ritenzione derivato
        # (RETENTION_FACTORS, broccoli/boiled) -- resta intenzionalmente
        # 'draft' e non va promossa a 'verified'/mostrata nella Dispensa,
        # altrimenti comparirebbero due vie per lo stesso "broccolo cotto"
        # (questa riga + il selettore "Cottura" su food_broccoli_raw).
        "food_id": "food_broccoli_boiled",
        "name_it": "Broccoli, bolliti e scolati",
        "matrix_id": "broccoli",
        "baseline_cooking_state": "boiled",
        "is_heme_iron": False,
        "matrix_category_calcium": None,
        "botanical_family": "Brassicaceae",
        "carotenoid_matrix_state": "cooked_or_disrupted",
        "fdc_id": 169967,
        "fdc_name": "Broccoli, cooked, boiled, drained, without salt",
        "values": {
            "iron_mg": 0.67, "zinc_mg": 0.45, "calcium_mg": 40, "vitamin_c_mg": 64.9,
            "magnesium_mg": 21.0, "copper_mg": 0.061, "selenium_mcg": 1.6,
            "vitamin_k_mcg": 141, "vitamin_b12_mcg": 0.00, "folate_mcg": 108,
            "beta_carotene_mcg": 929, "other_provitamin_a_carotenoids_mcg": 0,  # alpha=0, crypto=0
            "energy_kcal": 35.0, "protein_g": 2.38, "fat_g": 0.41, "carbohydrates_g": 7.18, "fiber_g": 3.30,
        },
    },
    {
        "food_id": "food_almonds",
        "name_it": "Mandorle, secche, non salate",
        "matrix_id": "nuts_almonds",
        "baseline_cooking_state": "raw",
        "is_heme_iron": False,
        "matrix_category_calcium": None,
        # Botanicamente le mandorle (Prunus dulcis) sono Rosaceae, non
        # Fabaceae -- nonostante il nome comune "nut", non sono un legume.
        "botanical_family": "Rosaceae",
        "fdc_id": 170567,
        "fdc_name": "Nuts, almonds",
        "values": {
            "iron_mg": 3.71, "zinc_mg": 3.12, "calcium_mg": 269, "vitamin_c_mg": 0.0,
            "magnesium_mg": 270.0, "copper_mg": 1.03, "selenium_mcg": 4.1,
            "vitamin_k_mcg": 0.0, "vitamin_b12_mcg": 0.00, "folate_mcg": 44,
            "energy_kcal": 579, "protein_g": 21.1, "fat_g": 49.9, "carbohydrates_g": 21.6, "fiber_g": 12.5,
        },
    },
    {
        "food_id": "food_oranges_raw",
        "name_it": "Arance, crude, tutte le varieta' commerciali",
        "matrix_id": "citrus_oranges",
        # NOTA 2026-10-10: questo alimento era rimasto fuori dal backfill
        # originale di fix_baseline_cooking_state.sql (svista: 19 righe
        # aggiornate su 20 alimenti del Golden Set, 'food_oranges_raw'
        # dimenticata) -- restava 'unknown' sul DB live. Corretto qui e
        # nel DB live (2026-10-10, stessa sessione).
        "baseline_cooking_state": "raw",
        "is_heme_iron": False,
        "matrix_category_calcium": None,
        "botanical_family": "Rutaceae",
        "carotenoid_matrix_state": "raw_intact",
        "fdc_id": 169097,
        "fdc_name": "Oranges, raw, all commercial varieties",
        "values": {
            "iron_mg": 0.10, "zinc_mg": 0.07, "calcium_mg": 40, "vitamin_c_mg": 53.2,
            "magnesium_mg": 10.0, "copper_mg": 0.045, "selenium_mcg": 0.5,
            "vitamin_k_mcg": 0.0, "vitamin_b12_mcg": 0.00, "folate_mcg": 30,
            "beta_carotene_mcg": 71, "other_provitamin_a_carotenoids_mcg": 127,  # alpha=11, crypto=116
            "energy_kcal": 47.0, "protein_g": 0.94, "fat_g": 0.12, "carbohydrates_g": 11.8, "fiber_g": 2.40,
        },
    },
    {
        "food_id": "food_egg_hard_boiled",
        "name_it": "Uovo, intero, cotto (sodo)",
        "matrix_id": "eggs",
        "baseline_cooking_state": "hard_boiled",
        "is_heme_iron": False,
        "matrix_category_calcium": None,
        "botanical_family": None,
        "fdc_id": 173424,
        "fdc_name": "Egg, whole, cooked, hard-boiled",
        "values": {
            "iron_mg": 1.19, "zinc_mg": 1.05, "calcium_mg": 50, "vitamin_c_mg": 0.0,
            "magnesium_mg": 10.0, "copper_mg": 0.013, "selenium_mcg": 30.8,
            "vitamin_k_mcg": 0.3, "vitamin_b12_mcg": 1.11, "folate_mcg": 44,
            "energy_kcal": 155, "protein_g": 12.6, "fat_g": 10.6, "carbohydrates_g": 1.12, "fiber_g": 0.0,
        },
    },
    {
        # is_heme_iron = True per coerenza con la convenzione gia' usata per
        # fegato/manzo macinato in questo Golden Set (ferro di tessuto
        # muscolare animale = eme), non una misura diretta della quota
        # eme/non-eme specifica di questo FDC ID.
        "food_id": "food_salmon_cooked",
        "name_it": "Salmone atlantico, allevato, cotto (calore secco)",
        "matrix_id": "salmon_fish",
        "baseline_cooking_state": "dry_heat_cooked",
        "is_heme_iron": True,
        "matrix_category_calcium": None,
        "botanical_family": None,
        "fdc_id": 175168,
        "fdc_name": "Fish, salmon, Atlantic, farmed, cooked, dry heat",
        "values": {
            "iron_mg": 0.34, "zinc_mg": 0.43, "calcium_mg": 15, "vitamin_c_mg": 3.7,
            "magnesium_mg": 30.0, "copper_mg": 0.049, "selenium_mcg": 41.4,
            "vitamin_k_mcg": 0.1, "vitamin_b12_mcg": 2.80, "folate_mcg": 34,
            "energy_kcal": 206, "protein_g": 22.1, "fat_g": 12.3, "carbohydrates_g": 0.0, "fiber_g": 0.0,
        },
    },
    {
        # vitamin_b12_mcg: il record FDC riporta 0.00 ma con 0 data points
        # ("il valore e' presente, ma non e' una misura affidabile" --
        # diverso dal B12=0.00 "assumed zero" degli altri alimenti vegetali
        # di questo set, che hanno invece data points reali a supporto
        # dello zero). Inserito comunque come 0.00/USDA_FDC per coerenza
        # con gli altri alimenti vegetali (un legume non contiene B12 per
        # ragioni biologiche note, indipendentemente da questo limite
        # metodologico del singolo record FDC), ma il limite e' dichiarato
        # qui e nella sezione gap finale, non nascosto.
        "food_id": "food_chickpeas_boiled",
        "name_it": "Ceci, semi maturi, bolliti, senza sale",
        "matrix_id": "legumes",
        "baseline_cooking_state": "boiled",
        "is_heme_iron": False,
        "matrix_category_calcium": None,
        "botanical_family": "Fabaceae",
        "fdc_id": 173757,
        "fdc_name": "Chickpeas (garbanzo beans, bengal gram), mature seeds, cooked, boiled, without salt",
        "values": {
            "iron_mg": 2.89, "zinc_mg": 1.53, "calcium_mg": 49, "vitamin_c_mg": 1.3,
            "magnesium_mg": 48.0, "copper_mg": 0.352, "selenium_mcg": 3.7,
            "vitamin_k_mcg": 4.0, "vitamin_b12_mcg": 0.00, "folate_mcg": 172,
            "energy_kcal": 164, "protein_g": 8.86, "fat_g": 2.59, "carbohydrates_g": 27.4, "fiber_g": 7.60,
        },
    },
    {
        # 20mo alimento: l'esempio fortificato richiesto per esercitare
        # is_fortified_folate su un dato reale (vedi docs/PRD.md §4.6). Non e'
        # un cereale da colazione (Kellogg's Corn Flakes, provato in una
        # sessione precedente, non era raggiungibile), ma una voce SR
        # Legacy generica USDA: la pasta arricchita negli USA e' soggetta
        # alla fortificazione obbligatoria FDA con acido folico dal 1998
        # (farina enriched), quindi e' un esempio reale e non un cereale
        # "a scelta" per convenienza.
        #
        # ATTENZIONE al significato del campo folate_mcg per questa riga:
        # types.ts documenta folate_mcg come "folato alimentare naturale",
        # ma calculateFolateDFE (vedi computationalNutritionEngine.ts:355)
        # usa UN SOLO campo numerico con doppio significato a seconda del
        # flag: se is_fortified_folate=false, folate_mcg è il folato
        # alimentare naturale (DFE = valore x1); se true, il valore viene
        # diviso per 0.6 (= x1.7, conversione FNB per acido folico da
        # fortificazione) -- quindi per un alimento fortificato il campo
        # deve contenere la quota di ACIDO FOLICO sintetico, non il folato
        # totale. Il record FDC per questa pasta riporta tre numeri
        # distinti (folato totale 73 µg, acido folico 66 µg, folato
        # alimentare "naturale" 7 µg): inserito qui SOLO l'acido folico
        # (66 µg), coerente con la semantica a singolo-campo già
        # implementata e testata (tests/engines.test.ts, "acido folico
        # fortificato"). La quota di folato naturale (7 µg) resta quindi
        # non rappresentata in questa riga -- limite preesistente dello
        # schema a un solo campo folate_mcg, non introdotto ora, ma
        # dichiarato qui perché e' il primo alimento reale che lo rende
        # visibile (prima esercitato solo da dati sintetici nei test).
        "food_id": "food_pasta_enriched_cooked",
        "name_it": "Pasta, cotta, arricchita (enriched), senza sale aggiunto",
        "matrix_id": "pasta_enriched_wheat",
        "baseline_cooking_state": "boiled",
        "is_heme_iron": False,
        "matrix_category_calcium": None,
        "botanical_family": "Poaceae",
        "is_fortified_folate": True,
        "fdc_id": 169737,
        "fdc_name": "Pasta, cooked, enriched, without added salt",
        "values": {
            "iron_mg": 1.28, "zinc_mg": 0.51, "calcium_mg": 7, "vitamin_c_mg": 0.0,
            "magnesium_mg": 18.0, "copper_mg": 0.100, "selenium_mcg": 26.4,
            # Vitamina K: il record FDC riporta separatamente fillochinone
            # (K1) = 0.0 µg e diidro-fillochinone = 0.5 µg; inserito solo
            # il fillochinone (K1), coerente con quanto l'engine modella
            # (vedi docs/PRD.md §4.5: "non distingue K1/K2" -- il
            # diidro-fillochinone non e' K2 e non e' trattato qui).
            "vitamin_k_mcg": 0.0, "vitamin_b12_mcg": 0.00,
            "folate_mcg": 66,  # acido folico, non folato totale -- vedi nota sopra
            "beta_carotene_mcg": 0, "other_provitamin_a_carotenoids_mcg": 0,
            "energy_kcal": 158, "protein_g": 5.80, "fat_g": 0.93, "carbohydrates_g": 30.9, "fiber_g": 1.80,
        },
    },
    # ------------------------------------------------------------------
    # AGGIUNTI 2026-10-10 (secondo giro): 9 baseline crudi reali, sourced
    # USDA FDC, per le 7 matrici che avevano SOLO un valore già cotto
    # salvato (vedi fix_baseline_cooking_state.sql) -- nessun punto di
    # partenza da cui CookingTransformationEngine potesse applicare un
    # fattore di ritenzione senza rischiare uno sconto doppio. Ricerca
    # delegata a 3 subagent paralleli con l'istruzione esplicita "zero
    # dati inventati"; fdc.nal.usda.gov non raggiungibile direttamente in
    # questa sessione -> dati estratti via getfoodfacts.com (mirror che
    # cita esplicitamente l'FDC ID in pagina) e verificati contro l'FDC ID
    # citato. Vedi golden_set_raw_baselines.sql per il dettaglio completo
    # (incluso il fattore di ritenzione dairy_milk+boiled, non gestito da
    # questo script -- vedi nota in testa al file).
    # ------------------------------------------------------------------
    {
        "food_id": "food_potato_raw",
        "name_it": "Patate, crude, con la buccia",
        "matrix_id": "tubers",
        "baseline_cooking_state": "raw",
        "is_heme_iron": False,
        "matrix_category_calcium": None,
        "botanical_family": "Solanaceae",
        "fdc_id": 170026,
        "fdc_name": "Potatoes, flesh and skin, raw",
        "values": {
            "iron_mg": 0.81, "zinc_mg": 0.30, "calcium_mg": 12, "vitamin_c_mg": 19.7,
            "magnesium_mg": 23.0, "copper_mg": 0.11, "selenium_mcg": 0.40,
            "vitamin_k_mcg": 2.00,  # fillochinone
            "vitamin_b12_mcg": 0.0,  # coerenza biologica (vegetale); zero non confermato come "zero con dati" nel record originale, stesso limite già accettato per food_chickpeas_boiled
            "folate_mcg": 15.0,
            "energy_kcal": 77.0, "protein_g": 2.05, "fat_g": 0.090, "carbohydrates_g": 17.5, "fiber_g": 2.10,
        },
        # Gap dichiarati: phytates_mg, oxalates_mg (non nel profilo SR Legacy standard consultato).
    },
    {
        "food_id": "food_kidney_beans_raw",
        "name_it": "Fagioli rossi (kidney), crudi, secchi",
        "matrix_id": "legumes",
        "baseline_cooking_state": "raw",
        "is_heme_iron": False,
        "matrix_category_calcium": None,
        "botanical_family": "Fabaceae",
        # NOTA: esiste anche una voce più specifica "red kidney beans" (NDB
        # 16032) con valori leggermente diversi, ma il subagent non ha
        # potuto confermarne l'FDC ID da una fonte che lo citi
        # esplicitamente -- usata la voce "all types" il cui FDC ID 175193
        # è confermato su 2 fonti indipendenti.
        "fdc_id": 175193,
        "fdc_name": "Beans, kidney, all types, mature seeds, raw",
        "values": {
            "iron_mg": 8.20, "zinc_mg": 2.79, "calcium_mg": 143, "vitamin_c_mg": 4.50,
            "magnesium_mg": 140, "copper_mg": 0.96, "selenium_mcg": 3.20,
            "vitamin_k_mcg": 19.0, "vitamin_b12_mcg": 0.0, "folate_mcg": 394,
            "energy_kcal": 333, "protein_g": 23.6, "fat_g": 0.83, "carbohydrates_g": 60.0, "fiber_g": 24.9,
        },
        # Gap dichiarati: phytates_mg, oxalates_mg.
    },
    {
        # Sostituisce una vecchia riga cruft dello stesso food_id (fonti
        # NULL, residuo pre-Golden-Set già declassato a 'draft' in
        # fix_baseline_cooking_state.sql) -- già rimossa dal DB live in
        # golden_set_raw_baselines.sql (DELETE esplicito prima di questo
        # INSERT, dato che ON CONFLICT da solo avrebbe lasciato intatte le
        # vecchie righe nutrient_values non presenti in questo dict).
        "food_id": "food_lentils_raw",
        "name_it": "Lenticchie, crude, secche",
        "matrix_id": "legumes",
        "baseline_cooking_state": "raw",
        "is_heme_iron": False,
        "matrix_category_calcium": None,
        "botanical_family": "Fabaceae",
        "fdc_id": 172420,
        "fdc_name": "Lentils, raw",
        "values": {
            "iron_mg": 6.51, "zinc_mg": 3.27, "calcium_mg": 35.0, "vitamin_c_mg": 4.50,
            "magnesium_mg": 47.0, "copper_mg": 0.75, "selenium_mcg": 0.10,
            "vitamin_k_mcg": 5.00, "vitamin_b12_mcg": 0.0, "folate_mcg": 479,
            "energy_kcal": 352, "protein_g": 24.6, "fat_g": 1.06, "carbohydrates_g": 63.4, "fiber_g": 10.7,
        },
        # Gap dichiarati: phytates_mg, oxalates_mg.
    },
    {
        # ATTENZIONE: questo food_id era GIA' presente nel DB (uno dei 19
        # alimenti demo pre-Golden-Set, già 'draft'/invisibile in UI, vedi
        # fix_baseline_cooking_state.sql). Il generatore lo aggiorna
        # tramite ON CONFLICT DO UPDATE su foods_raw e nutrient_values, ma
        # 4 righe del vecchio seed (macs_mg, oxalates_mg, phytates_mg,
        # polyphenols_mg, tutte source_id NULL) NON fanno parte di questo
        # dict e sono state rimosse a parte sul DB live
        # (cleanup_chickpeas_raw_cruft.sql) -- questo script da solo non
        # le avrebbe toccate (ON CONFLICT aggiorna solo i nutrient_code
        # elencati qui, non cancella righe extra).
        "food_id": "food_chickpeas_raw",
        "name_it": "Ceci, crudi, secchi",
        "matrix_id": "legumes",
        "baseline_cooking_state": "raw",
        "is_heme_iron": False,
        "matrix_category_calcium": None,
        "botanical_family": "Fabaceae",
        "fdc_id": 173756,
        "fdc_name": "Chickpeas (garbanzo beans, bengal gram), mature seeds, raw",
        "values": {
            "iron_mg": 4.31, "zinc_mg": 2.76, "calcium_mg": 57.0, "vitamin_c_mg": 4.00,
            "magnesium_mg": 79.0, "copper_mg": 0.66,
            "vitamin_k_mcg": 9.00, "vitamin_b12_mcg": 0.0, "folate_mcg": 557,
            "energy_kcal": 378, "protein_g": 20.5, "fat_g": 6.04, "carbohydrates_g": 63.0, "fiber_g": 12.2,
        },
        # Gap dichiarati: phytates_mg, oxalates_mg, selenium_mcg (fonte
        # mostra 0 µg ma il subagent non è riuscito a confermarlo come
        # zero dichiarato con dati a supporto piuttosto che campo assente
        # -- per cautela NON inserito, diversamente dal B12 dove il
        # precedente food_chickpeas_boiled già accetta questa stessa
        # ambiguità per coerenza biologica).
    },
    {
        "food_id": "food_beef_liver_raw",
        "name_it": "Fegato di manzo, crudo",
        "matrix_id": "beef_liver",
        "baseline_cooking_state": "raw",
        "is_heme_iron": True,
        "matrix_category_calcium": None,
        "botanical_family": None,
        "fdc_id": 169451,
        "fdc_name": "Beef, variety meats and by-products, liver, raw",
        "values": {
            "iron_mg": 4.90,  # ferro totale, la fonte SR Legacy non scompone eme/non-eme
            "zinc_mg": 4.00, "calcium_mg": 5.00, "vitamin_c_mg": 1.30,
            "magnesium_mg": 18.0, "copper_mg": 9.76, "selenium_mcg": 39.7,
            "vitamin_k_mcg": 3.10,  # fillochinone, non "vitamina K totale" aggregata
            "vitamin_b12_mcg": 59.3, "folate_mcg": 290,
            "energy_kcal": 135, "protein_g": 20.4, "fat_g": 3.63, "carbohydrates_g": 3.89, "fiber_g": 0.0,
        },
    },
    {
        "food_id": "food_beef_ground_raw",
        "name_it": "Manzo macinato (85% magro), crudo",
        "matrix_id": "beef_ground_meat",
        "baseline_cooking_state": "raw",
        "is_heme_iron": True,
        "matrix_category_calcium": None,
        "botanical_family": None,
        "fdc_id": 171796,
        "fdc_name": "Beef, ground, 85% lean meat / 15% fat, raw",
        "values": {
            "iron_mg": 2.09,  # ferro totale, fonte non scompone eme/non-eme
            "zinc_mg": 4.48, "calcium_mg": 15.0, "vitamin_c_mg": 0.0,
            "magnesium_mg": 18.0, "copper_mg": 0.067, "selenium_mcg": 15.8,
            "vitamin_k_mcg": 1.30,  # fillochinone
            "vitamin_b12_mcg": 2.17, "folate_mcg": 6.00,
            "energy_kcal": 215, "protein_g": 18.6, "fat_g": 15.0, "carbohydrates_g": 0.0, "fiber_g": 0.0,
        },
    },
    {
        "food_id": "food_egg_raw",
        "name_it": "Uovo, intero, crudo",
        "matrix_id": "eggs",
        "baseline_cooking_state": "raw",
        "is_heme_iron": False,
        "matrix_category_calcium": None,
        "botanical_family": None,
        "fdc_id": 171287,
        "fdc_name": "Egg, whole, raw, fresh",
        "values": {
            "iron_mg": 1.75, "zinc_mg": 1.29, "calcium_mg": 56.0, "vitamin_c_mg": 0.0,
            "magnesium_mg": 12.0, "copper_mg": 0.072, "selenium_mcg": 30.7,
            "vitamin_k_mcg": 0.30,  # fillochinone
            "vitamin_b12_mcg": 0.89, "folate_mcg": 47.0,
            "energy_kcal": 143, "protein_g": 12.6, "fat_g": 9.51, "carbohydrates_g": 0.72, "fiber_g": 0.0,
        },
    },
    {
        # is_heme_iron = True per coerenza con la convenzione già usata per
        # la controparte cotta di questo stesso alimento in questo Golden
        # Set, non una misura diretta della quota eme/non-eme specifica di
        # questo FDC ID (stessa nota già presente su food_salmon_cooked).
        "food_id": "food_salmon_raw",
        "name_it": "Salmone atlantico, allevato, crudo",
        "matrix_id": "salmon_fish",
        "baseline_cooking_state": "raw",
        "is_heme_iron": True,
        "matrix_category_calcium": None,
        "botanical_family": None,
        # SR Legacy, stessa serie/metodologia della voce cotta già in DB
        # (FDC 175168) -- scelta deliberata per coerenza nel calcolo di
        # ritenzione, invece della voce Foundation Foods più recente ma
        # metodologicamente diversa e meno completa (FDC 2684441).
        "fdc_id": 175167,
        "fdc_name": "Fish, salmon, Atlantic, farmed, raw",
        "values": {
            "iron_mg": 0.34, "zinc_mg": 0.36, "calcium_mg": 9.00, "vitamin_c_mg": 3.90,
            "magnesium_mg": 27.0, "copper_mg": 0.045, "selenium_mcg": 24.0,
            "vitamin_k_mcg": 0.50, "vitamin_b12_mcg": 3.23,
            "energy_kcal": 208, "protein_g": 20.4, "fat_g": 13.4, "carbohydrates_g": 0.0, "fiber_g": 0.0,
        },
        # Gap dichiarato: folate_mcg non riportato dalla fonte per questa voce.
    },
    {
        "food_id": "food_pasta_enriched_dry",
        "name_it": "Pasta, secca, arricchita (enriched), non cotta",
        "matrix_id": "pasta_enriched_wheat",
        "baseline_cooking_state": "raw",
        "is_heme_iron": False,
        "matrix_category_calcium": None,
        "botanical_family": "Poaceae",
        "is_fortified_folate": True,
        # Stessa serie della voce cotta già in DB (FDC 169737).
        "fdc_id": 169736,
        "fdc_name": "Pasta, dry, enriched",
        "values": {
            "iron_mg": 3.30, "zinc_mg": 1.41, "calcium_mg": 21.0, "vitamin_c_mg": 0.0,
            "magnesium_mg": 53.0, "copper_mg": 0.29, "selenium_mcg": 63.2,
            "vitamin_k_mcg": 0.10, "vitamin_b12_mcg": 0.0,
            # Folato totale 237 µg, di cui 219 µg acido folico SINTETICO
            # aggiunto e solo 18 µg folato alimentare naturale -- stesso
            # problema già documentato per la versione cotta
            # (food_pasta_enriched_cooked sopra): la quota sintetica
            # domina anche nella versione secca, non è un effetto della
            # cottura. Qui si usa "total" per coerenza con
            # calculateFolateDFE a singolo campo, stesso limite.
            "folate_mcg": 237,
            "energy_kcal": 371, "protein_g": 13.0, "fat_g": 1.51, "carbohydrates_g": 74.7, "fiber_g": 3.20,
        },
    },
]

MATRICES_NEEDED_NEW = [
    ("dairy_milk", "Latte e derivati, latte vaccino"),
    ("carrots", "Carote"),
    ("beef_liver", "Fegato di manzo"),
    ("beef_ground_meat", "Manzo macinato"),
    ("broccoli", "Broccoli"),
    ("nuts_almonds", "Mandorle"),
    ("citrus_oranges", "Arance"),
    ("eggs", "Uova"),
    ("salmon_fish", "Salmone"),
    ("pasta_enriched_wheat", "Pasta di grano, arricchita (enriched)"),
    # Aggiunte 2026-10-10 (terzo giro, fusione fattori di ritenzione): queste
    # 4 matrici erano create solo da file SQL sparsi (retention_factors_
    # legumi_tuberi.sql, fix_sources_e_retention_factors.sql,
    # retention_factors_crucifere.sql), non dal generatore -- nonostante
    # fossero già referenziate da alimenti FOODS sopra. ON CONFLICT DO NOTHING
    # le rende innocue da ri-eseguire.
    ("leafy_greens", "Verdure a foglia verde"),
    ("legumes", "Legumi secchi (fagioli, lenticchie, piselli, ceci)"),
    ("tubers", "Tuberi (patate)"),
    ("crucifere_cavoletti_bruxelles", "Cavoletti di Bruxelles"),
]

SOURCES_NEW = [
    ("NOONAN_SAVAGE_1999_APJCN",
     "Noonan SC, Savage GP. Oxalate content of foods and its effect on humans. Asia Pac J Clin Nutr. 1999;8(1):64-74. [spinaci crude: range 320-1260 mg/100g, media 970 mg/100g peso fresco, ossalato totale]",
     "https://apjcn.qdu.edu.cn/8_1_5.pdf"),
    ("ERDOGAN_ONAR_2012_JFDA",
     "Erdogan BY, Onar AN. Determination of nitrates, nitrites and oxalates in kale and sultana pea by capillary electrophoresis. J Food Drug Anal. 2012;20(2):14. [kale: 2970+/-672 mg/kg = 297+/-67.2 mg/100g, conversione aritmetica kg->100g]",
     "https://doi.org/10.6227/jfda.2012200215"),
    ("ZIA_UR_REHMAN_2002_PJSIR",
     "Zia-ur-Rehman, Salariya AM, Zafar SI. Effect of different soaking and cooking methods on physical characteristics, phytic acid content and protein digestibility of red kidney beans. Pak J Sci Ind Res. 2002;45(1):41-45. [fagioli rossi: crudo 1084 mg/100g, bollito (cottura ordinaria) 805 mg/100g]",
     "https://v2.pjsir.org/index.php/biological-sciences/article/download/1741/1075/2257"),
    # Aggiunte 2026-10-10 (terzo giro): fonti usate dai fattori di ritenzione
    # di cottura, finora dichiarate solo nei singoli file SQL sparsi.
    ("USDA_RETN06",
     "USDA Table of Nutrient Retention Factors, Release 6 (2007). Pubblico dominio (CC0). DOI 10.15482/USDA.ADC/1409034",
     "https://www.ars.usda.gov/ARSUserFiles/80400535/Data/retn/retn06.pdf"),
    ("DONIEC_2022_MOLECULES",
     "Doniec J, Florkiewicz A, Duliński R, Filipiak-Florkiewicz A. Impact of Hydrothermal Treatments on Nutritional Value and Mineral Bioaccessibility of Brussels Sprouts (Brassica oleracea var. gemmifera). Molecules. 2022;27(6):1861.",
     "https://doi.org/10.3390/molecules27061861"),
    # Aggiunta 2026-10-10 (ri-verifica Fase 1 punto 6, vedi
    # fix_literature_sources_recheck.sql): sostituisce NOONAN_SAVAGE_1999_APJCN
    # come fonte per food_spinach_raw.oxalates_mg, per decisione esplicita
    # dell'utente (fonte piu' recente e primaria vs review di sintesi).
    # Citazione di seconda mano: testo completo non letto da Claude (paywall).
    ("SIENER_2006_FOODCHEM",
     "Siener R, Hönow R, Seidler A, Voss S, Hesse A. Oxalate contents of species of the Polygonaceae, Amaranthaceae and Chenopodiaceae families. Food Chemistry. 2006;98(2):220-224. [spinaci: ossalato totale 1959 mg/100g, solubile 1029 mg/100g -- citazione di seconda mano, testo completo non letto direttamente per paywall]",
     "https://doi.org/10.1016/j.foodchem.2005.05.079"),
    # Aggiunta 2026-10-10 (quarto giro): NON una citazione di letteratura --
    # un metodo. Decisione esplicita dell'utente (chat, 2026-10-10): dove
    # non esiste un fattore di ritenzione pubblicato per una matrice, MA
    # abbiamo due alimenti del Golden Set misurati indipendentemente da USDA
    # FDC per la stessa matrice (uno crudo, uno già cotto con lo stesso
    # metodo), il fattore di ritenzione si DERIVA come
    # valore_cotto_per_100g / valore_crudo_per_100g -- non e' un numero
    # scelto da Claude, e' il rapporto fra due misure reali, citate, lette
    # da fonte primaria (stesso standard del resto del Golden Set). Resta
    # "draft" (non "verified" come i fattori di Doniec 2022) perche' nessun
    # paper ha validato questo SPECIFICO rapporto come fattore di ritenzione
    # -- e perche' il metodo ignora la variazione di resa/massa fra crudo e
    # cotto (vedi nota nel commento di RETENTION_FACTORS). Esclude
    # esplicitamente beta-carotene/altri carotenoidi provitaminici A: quel
    # contenuto e' già gestito da carotenoid_matrix_state (Livny 2003),
    # applicarci sopra anche questo rapporto conterebbe due volte lo stesso
    # effetto di disgregazione della matrice.
    ("DERIVED_FDC_RAW_COOKED_RATIO",
     "Metodo interno (non letteratura): fattore di ritenzione = valore_cotto_per_100g / valore_crudo_per_100g, da coppie di alimenti Golden Set misurati indipendentemente da USDA FoodData Central con lo stesso metodo di cottura. Coppie usate finora: broccoli (FDC 170379 crudo / 169967 bolliti), carote (FDC 170393 crude / 170394 bollite). Non copre beta-carotene/altri carotenoidi provitaminici A (vedi carotenoid_matrix_state).",
     None),
]

# ---------------------------------------------------------------------------
# RETENTION_FACTORS: fattori di ritenzione di cottura, aggiunti al
# generatore 2026-10-10 (terzo giro) -- fondono in FOODS/scripts quanto
# prima era sparso su 4 file (retention_factors_legumi_tuberi.sql,
# retention_factors_crucifere.sql, retention_factors_padella.sql,
# fix_sources_e_retention_factors.sql) più il fattore latte di
# golden_set_raw_baselines.sql. Stessi valori, stesse fonti, stesso
# verification_status di quei file -- nessun numero nuovo introdotto qui.
#
# ATTENZIONE -- leafy_greens/boiled/vitamin_c: il valore CORRETTO e
# sourced e' 0.58 (USDA Release 6, confidence 0.55-0.60), come dichiarato
# in fix_sources_e_retention_factors.sql. Verificando il DB live durante
# questa fusione (2026-10-10) e' emerso che quella riga porta invece il
# valore 0.50 con source_id NULL -- un dato senza fonte, diverso da quanto
# dichiarato nel file versionato, segnalato e confermato come cruft
# dall'utente. L'ON CONFLICT DO UPDATE sotto, una volta eseguito contro il
# DB live, corregge questa riga al valore giusto (0.58/USDA_RETN06).
# Analogamente trovate e confermate come cruft (non presenti qui, da
# rimuovere a parte, non da "aggiustare" con un valore sostitutivo perché
# non esiste una fonte per loro): leafy_greens/steamed/vitamin_c=0.85,
# legumes/boiled/phytates=0.40, pome_fruits/steamed/polyphenols=0.80 --
# tutte source_id NULL, nessuna delle 3 presente in nessun file versionato.
# ---------------------------------------------------------------------------
RETENTION_FACTORS = [
    # Crucifere (cavoletti di Bruxelles) -- Doniec et al. 2022, verified
    {"matrix_id": "crucifere_cavoletti_bruxelles", "cooking_method": "boiled", "nutrient": "iron",
     "value": 1.00, "source_id": "DONIEC_2022_MOLECULES", "verification_status": "verified"},
    {"matrix_id": "crucifere_cavoletti_bruxelles", "cooking_method": "boiled", "nutrient": "zinc",
     "value": 0.78, "source_id": "DONIEC_2022_MOLECULES", "verification_status": "verified"},
    {"matrix_id": "crucifere_cavoletti_bruxelles", "cooking_method": "steamed", "nutrient": "iron",
     "value": 1.00, "source_id": "DONIEC_2022_MOLECULES", "verification_status": "verified"},
    {"matrix_id": "crucifere_cavoletti_bruxelles", "cooking_method": "steamed", "nutrient": "zinc",
     "value": 0.81, "source_id": "DONIEC_2022_MOLECULES", "verification_status": "verified"},
    # Latte -- USDA Release 6 (ferro/zinco/calcio identici in tutte le
    # varianti di durata, vedi golden_set_raw_baselines.sql per la nota
    # sull'ambiguità di durata non inserita per B12/folato/vitamina C).
    {"matrix_id": "dairy_milk", "cooking_method": "boiled", "nutrient": "iron",
     "value": 1.00, "source_id": "USDA_RETN06", "verification_status": "draft"},
    {"matrix_id": "dairy_milk", "cooking_method": "boiled", "nutrient": "zinc",
     "value": 1.00, "source_id": "USDA_RETN06", "verification_status": "draft"},
    {"matrix_id": "dairy_milk", "cooking_method": "boiled", "nutrient": "calcium",
     "value": 1.00, "source_id": "USDA_RETN06", "verification_status": "draft"},
    # Verdure a foglia (spinaci/kale) -- USDA Release 6, categoria "verdure
    # a foglia verde, bollite, poca acqua scolata" (vedi nota di matrice in
    # fix_sources_e_retention_factors.sql: il range reale 0.55-0.60 copre
    # le varianti "poca acqua"/"molta acqua" scolate).
    {"matrix_id": "leafy_greens", "cooking_method": "boiled", "nutrient": "vitamin_c",
     "value": 0.58, "confidence_low": 0.55, "confidence_high": 0.60,
     "source_id": "USDA_RETN06", "verification_status": "draft"},
    # Legumi -- USDA Release 6, "16 LEGUMES". 'boiled' = cottura lunga
    # (45-75min, riga 0521/0525); 'boiled_quick_15_20min' = cottura rapida
    # tipo lenticchie (riga 0501); 'fried' = bollito+fritto in padella,
    # stessa fascia 45-75min per coerenza con 'boiled' (vedi limite
    # dichiarato in retention_factors_padella.sql: una semplificazione nota,
    # lenticchie/ceci userebbero in teoria righe diverse).
    {"matrix_id": "legumes", "cooking_method": "boiled", "nutrient": "iron",
     "value": 0.80, "source_id": "USDA_RETN06", "verification_status": "draft"},
    {"matrix_id": "legumes", "cooking_method": "boiled", "nutrient": "zinc",
     "value": 0.85, "source_id": "USDA_RETN06", "verification_status": "draft"},
    {"matrix_id": "legumes", "cooking_method": "boiled", "nutrient": "vitamin_c",
     "value": 0.65, "source_id": "USDA_RETN06", "verification_status": "draft"},
    {"matrix_id": "legumes", "cooking_method": "boiled_quick_15_20min", "nutrient": "iron",
     "value": 0.85, "source_id": "USDA_RETN06", "verification_status": "draft"},
    {"matrix_id": "legumes", "cooking_method": "boiled_quick_15_20min", "nutrient": "zinc",
     "value": 0.85, "source_id": "USDA_RETN06", "verification_status": "draft"},
    {"matrix_id": "legumes", "cooking_method": "boiled_quick_15_20min", "nutrient": "vitamin_c",
     "value": 0.65, "source_id": "USDA_RETN06", "verification_status": "draft"},
    {"matrix_id": "legumes", "cooking_method": "fried", "nutrient": "iron",
     "value": 0.80, "source_id": "USDA_RETN06", "verification_status": "draft"},
    {"matrix_id": "legumes", "cooking_method": "fried", "nutrient": "zinc",
     "value": 0.85, "source_id": "USDA_RETN06", "verification_status": "draft"},
    {"matrix_id": "legumes", "cooking_method": "fried", "nutrient": "vitamin_c",
     "value": 0.60, "source_id": "USDA_RETN06", "verification_status": "draft"},
    # Tuberi (patate) -- USDA Release 6, "11 POTATOES".
    {"matrix_id": "tubers", "cooking_method": "boiled_in_skin", "nutrient": "iron",
     "value": 0.95, "source_id": "USDA_RETN06", "verification_status": "draft"},
    {"matrix_id": "tubers", "cooking_method": "boiled_in_skin", "nutrient": "zinc",
     "value": 0.95, "source_id": "USDA_RETN06", "verification_status": "draft"},
    {"matrix_id": "tubers", "cooking_method": "boiled_in_skin", "nutrient": "vitamin_c",
     "value": 0.75, "source_id": "USDA_RETN06", "verification_status": "draft"},
    {"matrix_id": "tubers", "cooking_method": "fried", "nutrient": "iron",
     "value": 1.00, "source_id": "USDA_RETN06", "verification_status": "draft"},
    {"matrix_id": "tubers", "cooking_method": "fried", "nutrient": "zinc",
     "value": 1.00, "source_id": "USDA_RETN06", "verification_status": "draft"},
    {"matrix_id": "tubers", "cooking_method": "fried", "nutrient": "vitamin_c",
     "value": 0.80, "source_id": "USDA_RETN06", "verification_status": "draft"},
    # Broccoli e carote -- fattori DERIVATI (non da letteratura di
    # ritenzione), vedi DERIVED_FDC_RAW_COOKED_RATIO sopra. Decisione
    # esplicita dell'utente (chat, 2026-10-10): dove manca un fattore
    # pubblicato ma abbiamo due misure USDA FDC indipendenti (crudo/cotto)
    # per la stessa matrice, calcoliamo noi il rapporto invece di lasciare
    # "solo crudo" nel selettore di cottura. food_broccoli_boiled e
    # food_carrots_boiled restano nel Golden Set (draft, non promossi) solo
    # come base di calcolo tracciabile di questi rapporti -- non vanno
    # promossi a 'verified' ne' mostrati come voci a se' nella Dispensa,
    # altrimenti l'utente vedrebbe due vie per lo stesso "broccolo cotto"
    # (voce separata + selettore). beta_carotene/other_provitamin_a_
    # carotenoids_mcg ESCLUSI apposta (vedi nota sopra sul doppio conteggio
    # con carotenoid_matrix_state, corretto in cookingTransformationEngine.ts
    # per flippare lo stato quando un fattore di ritenzione reale si applica).
    #
    # Broccoli: FDC 170379 (crudo) -> FDC 169967 (bolliti e scolati).
    {"matrix_id": "broccoli", "cooking_method": "boiled", "nutrient": "iron",
     "value": 0.92, "source_id": "DERIVED_FDC_RAW_COOKED_RATIO", "verification_status": "draft"},
    {"matrix_id": "broccoli", "cooking_method": "boiled", "nutrient": "zinc",
     "value": 1.10, "source_id": "DERIVED_FDC_RAW_COOKED_RATIO", "verification_status": "draft"},
    {"matrix_id": "broccoli", "cooking_method": "boiled", "nutrient": "calcium",
     "value": 0.85, "source_id": "DERIVED_FDC_RAW_COOKED_RATIO", "verification_status": "draft"},
    {"matrix_id": "broccoli", "cooking_method": "boiled", "nutrient": "vitamin_c",
     "value": 0.73, "source_id": "DERIVED_FDC_RAW_COOKED_RATIO", "verification_status": "draft"},
    {"matrix_id": "broccoli", "cooking_method": "boiled", "nutrient": "magnesium",
     "value": 1.00, "source_id": "DERIVED_FDC_RAW_COOKED_RATIO", "verification_status": "draft"},
    {"matrix_id": "broccoli", "cooking_method": "boiled", "nutrient": "copper",
     "value": 1.24, "source_id": "DERIVED_FDC_RAW_COOKED_RATIO", "verification_status": "draft"},
    {"matrix_id": "broccoli", "cooking_method": "boiled", "nutrient": "selenium",
     "value": 0.64, "source_id": "DERIVED_FDC_RAW_COOKED_RATIO", "verification_status": "draft"},
    {"matrix_id": "broccoli", "cooking_method": "boiled", "nutrient": "vitamin_k",
     "value": 1.38, "source_id": "DERIVED_FDC_RAW_COOKED_RATIO", "verification_status": "draft"},
    # folate ESCLUSO: 108/63 = 1.71, fuori dal range [0.0, 1.5] del sanity
    # check sotto (RETENTION_FACTORS assert). Un aumento del 71% per un
    # nutriente che la letteratura generale descrive come termolabile/
    # degradato dalla bollitura non e' plausibile come vero effetto di
    # cottura -- piu' probabile varianza fra campioni USDA diversi che
    # biologia reale. Gap dichiarato: selezionare "Bollito" per i broccoli
    # non altera folate_mcg (resta il valore crudo), invece di propagare
    # un numero implausibile.
    {"matrix_id": "broccoli", "cooking_method": "boiled", "nutrient": "energy",
     "value": 1.03, "source_id": "DERIVED_FDC_RAW_COOKED_RATIO", "verification_status": "draft"},
    {"matrix_id": "broccoli", "cooking_method": "boiled", "nutrient": "protein",
     "value": 0.84, "source_id": "DERIVED_FDC_RAW_COOKED_RATIO", "verification_status": "draft"},
    {"matrix_id": "broccoli", "cooking_method": "boiled", "nutrient": "fat",
     "value": 1.11, "source_id": "DERIVED_FDC_RAW_COOKED_RATIO", "verification_status": "draft"},
    {"matrix_id": "broccoli", "cooking_method": "boiled", "nutrient": "carbohydrates",
     "value": 1.08, "source_id": "DERIVED_FDC_RAW_COOKED_RATIO", "verification_status": "draft"},
    {"matrix_id": "broccoli", "cooking_method": "boiled", "nutrient": "fiber",
     "value": 1.27, "source_id": "DERIVED_FDC_RAW_COOKED_RATIO", "verification_status": "draft"},
    # Carote: FDC 170393 (crude) -> FDC 170394 (bollite e scolate).
    {"matrix_id": "carrots", "cooking_method": "boiled", "nutrient": "iron",
     "value": 1.13, "source_id": "DERIVED_FDC_RAW_COOKED_RATIO", "verification_status": "draft"},
    {"matrix_id": "carrots", "cooking_method": "boiled", "nutrient": "zinc",
     "value": 0.83, "source_id": "DERIVED_FDC_RAW_COOKED_RATIO", "verification_status": "draft"},
    {"matrix_id": "carrots", "cooking_method": "boiled", "nutrient": "calcium",
     "value": 0.91, "source_id": "DERIVED_FDC_RAW_COOKED_RATIO", "verification_status": "draft"},
    {"matrix_id": "carrots", "cooking_method": "boiled", "nutrient": "vitamin_c",
     "value": 0.61, "source_id": "DERIVED_FDC_RAW_COOKED_RATIO", "verification_status": "draft"},
    {"matrix_id": "carrots", "cooking_method": "boiled", "nutrient": "magnesium",
     "value": 0.83, "source_id": "DERIVED_FDC_RAW_COOKED_RATIO", "verification_status": "draft"},
    {"matrix_id": "carrots", "cooking_method": "boiled", "nutrient": "copper",
     "value": 0.38, "source_id": "DERIVED_FDC_RAW_COOKED_RATIO", "verification_status": "draft"},
    # selenium ESCLUSO: 0.7/0.1 = 7.00, fuori dal range [0.0, 1.5] del
    # sanity check sotto (RETENTION_FACTORS assert) -- di molto. Entrambi i
    # valori sono vicini al limite di rilevabilita' (sub-microgrammo), un
    # rapporto 7x su valori-traccia riflette quasi certamente rumore di
    # misura, non una vera concentrazione fisiologica. Gap dichiarato:
    # selezionare "Bollito" per le carote non altera selenium_mcg (resta
    # il valore crudo), invece di propagare un numero implausibile.
    {"matrix_id": "carrots", "cooking_method": "boiled", "nutrient": "vitamin_k",
     "value": 1.04, "source_id": "DERIVED_FDC_RAW_COOKED_RATIO", "verification_status": "draft"},
    {"matrix_id": "carrots", "cooking_method": "boiled", "nutrient": "folate",
     "value": 0.74, "source_id": "DERIVED_FDC_RAW_COOKED_RATIO", "verification_status": "draft"},
    {"matrix_id": "carrots", "cooking_method": "boiled", "nutrient": "energy",
     "value": 0.85, "source_id": "DERIVED_FDC_RAW_COOKED_RATIO", "verification_status": "draft"},
    {"matrix_id": "carrots", "cooking_method": "boiled", "nutrient": "protein",
     "value": 0.82, "source_id": "DERIVED_FDC_RAW_COOKED_RATIO", "verification_status": "draft"},
    {"matrix_id": "carrots", "cooking_method": "boiled", "nutrient": "fat",
     "value": 0.75, "source_id": "DERIVED_FDC_RAW_COOKED_RATIO", "verification_status": "draft"},
    {"matrix_id": "carrots", "cooking_method": "boiled", "nutrient": "carbohydrates",
     "value": 0.86, "source_id": "DERIVED_FDC_RAW_COOKED_RATIO", "verification_status": "draft"},
    {"matrix_id": "carrots", "cooking_method": "boiled", "nutrient": "fiber",
     "value": 1.07, "source_id": "DERIVED_FDC_RAW_COOKED_RATIO", "verification_status": "draft"},
]

# Sanity check difensivo: nessun duplicato (matrix_id, cooking_method, nutrient)
_rf_keys = [(r["matrix_id"], r["cooking_method"], r["nutrient"]) for r in RETENTION_FACTORS]
assert len(_rf_keys) == len(set(_rf_keys)), "RETENTION_FACTORS: chiave duplicata trovata!"
for _r in RETENTION_FACTORS:
    assert 0.0 <= _r["value"] <= 1.5, f"{_r}: value fuori range plausibile per un fattore di ritenzione"

# ---------------------------------------------------------------------------
def sql_str(s):
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"

def sql_num(n):
    if n is None:
        return "NULL"
    return repr(n)

lines = []
lines.append("-- ============================================================================")
lines.append("-- Golden Set: primi alimenti reali, sourced riga per riga (2026-10-09)")
lines.append("-- ============================================================================")
lines.append("--")
lines.append(f"-- {len(FOODS)} alimenti, ciascuno con composizione letta DIRETTAMENTE da USDA")
lines.append("-- FoodData Central (endpoint fdc.nal.usda.gov/portal-data/external/<FDC_ID>,")
lines.append("-- stesso dataset della pagina food-details ufficiale, usato perche' la SPA")
lines.append("-- Angular delle pagine food-details non e' fetchable direttamente da questo")
lines.append("-- ambiente) in questa sessione, con l'FDC ID citato per ogni riga cosi' da")
lines.append("-- poter essere riverificato in qualunque momento.")
lines.append("--")
lines.append("-- Ossalati e fitati (assenti da USDA FDC) aggiunti per 3 alimenti specifici")
lines.append("-- da fonti di letteratura dedicate (vedi sources sotto); dove la fonte non")
lines.append("-- coincideva per stato di cottura (es. fitati lenticchie: trovato solo per")
lines.append("-- crude, non per bollite) o era discordante tra piu' fonti senza una scelta")
lines.append("-- ovvia (ossalati spinaci: Noonan&Savage 1999 vs Siener 2006), il dato NON")
lines.append("-- e' stato inserito -- resta un gap dichiarato, non un numero indovinato.")
lines.append("--")
lines.append("-- verification_status = 'draft' per TUTTO (coerente con la convenzione del")
lines.append("-- pannello admin: 'draft' finche' un revisore umano non promuove a")
lines.append("-- 'verified' dopo un controllo a campione -- anche se i valori sono stati")
lines.append("-- letti da una fonte ufficiale, non e' stato ancora fatto quel secondo")
lines.append("-- controllo da parte dell'utente/esperto di dominio).")
lines.append("-- ============================================================================")
lines.append("")

lines.append("-- ----------------------------------------------------------------------------")
lines.append("-- Nuove matrici (food_matrices_master) necessarie per i nuovi alimenti")
lines.append("-- ----------------------------------------------------------------------------")
lines.append("INSERT INTO food_matrices_master (matrix_id, description_it) VALUES")
lines.append(",\n".join(f"  ({sql_str(mid)}, {sql_str(desc)})" for mid, desc in MATRICES_NEEDED_NEW))
lines.append("ON CONFLICT (matrix_id) DO NOTHING;")
lines.append("")

lines.append("-- ----------------------------------------------------------------------------")
lines.append("-- Nuove fonti di letteratura (ossalati/fitati; USDA_FDC e' gia' un placeholder")
lines.append("-- generico usato dall'engine per magnesio/rame/selenio/iodio/vit.K, vedi")
lines.append("-- docs/PRD.md §4.5 -- qui lo aggiungiamo anche alla tabella sources se non c'era)")
lines.append("-- ----------------------------------------------------------------------------")
lines.append("INSERT INTO sources (id, citation, url_or_doi) VALUES")
lines.append("  ('USDA_FDC', 'USDA FoodData Central (fdc.nal.usda.gov), U.S. Department of Agriculture, Agricultural Research Service.', 'https://fdc.nal.usda.gov'),")
lines.append(",\n".join(f"  ({sql_str(sid)}, {sql_str(cit)}, {sql_str(url)})" for sid, cit, url in SOURCES_NEW) + "")
lines.append("ON CONFLICT (id) DO UPDATE SET citation = EXCLUDED.citation, url_or_doi = EXCLUDED.url_or_doi;")
lines.append("")

lines.append("-- ----------------------------------------------------------------------------")
lines.append("-- ALTER TABLE: colonne categoriche aggiunte al modello dati dopo la prima")
lines.append("-- stesura di foods_raw (carotenoid_matrix_state, zinc_bioaccessibility_bucket,")
lines.append("-- is_fortified_folate) -- vedi types.ts. Con CHECK, non un semplice text")
lines.append("-- libero: regola 'architettura difensiva', niente valori fuori enum scritti")
lines.append("-- per errore di digitazione nel pannello admin o in un futuro script.")
lines.append("-- ----------------------------------------------------------------------------")
lines.append("ALTER TABLE foods_raw ADD COLUMN IF NOT EXISTS carotenoid_matrix_state text;")
lines.append("ALTER TABLE foods_raw ADD COLUMN IF NOT EXISTS zinc_bioaccessibility_bucket text DEFAULT 'none';")
lines.append("ALTER TABLE foods_raw ADD COLUMN IF NOT EXISTS is_fortified_folate boolean DEFAULT false;")
lines.append("")
lines.append("DO $$ BEGIN")
lines.append("  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'foods_raw_carotenoid_matrix_state_check') THEN")
lines.append("    ALTER TABLE foods_raw ADD CONSTRAINT foods_raw_carotenoid_matrix_state_check")
lines.append("      CHECK (carotenoid_matrix_state IS NULL OR carotenoid_matrix_state IN ('raw_intact', 'cooked_or_disrupted'));")
lines.append("  END IF;")
lines.append("  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'foods_raw_zinc_bioaccessibility_bucket_check') THEN")
lines.append("    ALTER TABLE foods_raw ADD CONSTRAINT foods_raw_zinc_bioaccessibility_bucket_check")
lines.append("      CHECK (zinc_bioaccessibility_bucket IN ('none', 'brussels_sprouts_boiled', 'brussels_sprouts_steamed'));")
lines.append("  END IF;")
lines.append("END $$;")
lines.append("")
lines.append("-- NOTA ARCHITETTURALE (dichiarata, non implementata qui): queste tre colonne")
lines.append("-- sono attributi per-alimento-CONGELATI-nello-stato-di-cottura (come")
lines.append("-- is_heme_iron/matrix_category_calcium), non numeri che CookingTransformationEngine")
lines.append("-- possa derivare da un retention factor. Per questo i cavoletti di Bruxelles")
lines.append("-- 'al vapore' NON hanno una riga propria in questo Golden Set: nessuna misura")
lines.append("-- FDC diretta esiste per quello stato (FDC non ha una voce 'steamed' per i")
lines.append("-- cavoletti), e derivare una riga finta applicando il retention factor di")
lines.append("-- Doniec 2022 al solo ferro/zinco crudo, lasciando tutto il resto nullo,")
lines.append("-- mischierebbe dato misurato e dato simulato nella stessa riga foods_raw --")
lines.append("-- disonesto secondo la regola 'zero dati inventati'. Resta quindi un gap")
lines.append("-- dichiarato: il layer di bioaccessibilita' per i cavoletti al vapore e'")
lines.append("-- oggi testato solo su dati sintetici (tests/engines.test.ts), non ancora")
lines.append("-- su un alimento reale del Golden Set.")
lines.append("")

lines.append("-- ----------------------------------------------------------------------------")
lines.append("-- Alimenti (foods_raw) + valori nutrizionali (nutrient_values)")
lines.append("-- ----------------------------------------------------------------------------")

for food in FOODS:
    lines.append(f"-- {food['name_it']}  |  FDC: {food['fdc_name']} (FDC ID {food['fdc_id']})")
    lines.append(f"-- https://fdc.nal.usda.gov/food-details/{food['fdc_id']}/nutrients")
    assert "baseline_cooking_state" in food, (
        f"{food['food_id']}: baseline_cooking_state mancante -- campo obbligatorio dal "
        f"2026-10-10 (vedi fix_baseline_cooking_state.sql), mai lasciato implicito/default "
        f"per coerenza con 'architettura difensiva' (il default DB 'unknown' e' un fail-safe, "
        f"non una scorciatoia per non dichiarare lo stato reale)."
    )
    cols = ["food_id", "name_it", "matrix_id", "baseline_cooking_state", "is_heme_iron", "matrix_category_calcium", "botanical_family", "verification_status"]
    vals = [sql_str(food["food_id"]), sql_str(food["name_it"]), sql_str(food["matrix_id"]),
            sql_str(food["baseline_cooking_state"]),
            str(food["is_heme_iron"]).lower(), sql_str(food.get("matrix_category_calcium")),
            sql_str(food.get("botanical_family")), sql_str("draft")]
    if "carotenoid_matrix_state" in food:
        cols.append("carotenoid_matrix_state")
        vals.append(sql_str(food["carotenoid_matrix_state"]))
    if "zinc_bioaccessibility_bucket" in food:
        cols.append("zinc_bioaccessibility_bucket")
        vals.append(sql_str(food["zinc_bioaccessibility_bucket"]))
    if "is_fortified_folate" in food:
        cols.append("is_fortified_folate")
        vals.append(str(food["is_fortified_folate"]).lower())
    lines.append(f"INSERT INTO foods_raw ({', '.join(cols)}) VALUES")
    lines.append(f"  ({', '.join(vals)})")
    lines.append(f"ON CONFLICT (food_id) DO UPDATE SET")
    lines.append(f"  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,")
    lines.append(f"  baseline_cooking_state = EXCLUDED.baseline_cooking_state,")
    lines.append(f"  is_heme_iron = EXCLUDED.is_heme_iron,")
    lines.append(f"  matrix_category_calcium = EXCLUDED.matrix_category_calcium,")
    lines.append(f"  botanical_family = EXCLUDED.botanical_family" +
                 (",\n  carotenoid_matrix_state = EXCLUDED.carotenoid_matrix_state" if "carotenoid_matrix_state" in food else "") +
                 (",\n  zinc_bioaccessibility_bucket = EXCLUDED.zinc_bioaccessibility_bucket" if "zinc_bioaccessibility_bucket" in food else "") +
                 (",\n  is_fortified_folate = EXCLUDED.is_fortified_folate" if "is_fortified_folate" in food else "") +
                 ";")
    lines.append("")

    nv_rows = []
    for code, val in food["values"].items():
        nv_rows.append((code, val, None, None, "USDA_FDC"))
    for code, spec in food.get("extra", {}).items():
        nv_rows.append((code, spec["value"], spec.get("confidence_low"), spec.get("confidence_high"), spec["source_id"]))

    lines.append(f"INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES")
    row_strs = []
    for code, val, clow, chigh, sid in nv_rows:
        row_strs.append(f"  ({sql_str(food['food_id'])}, {sql_str(code)}, {sql_num(val)}, {sql_num(clow)}, {sql_num(chigh)}, {sql_str(sid)}, 'draft')")
    lines.append(",\n".join(row_strs))
    lines.append("ON CONFLICT (food_id, nutrient_code) DO UPDATE SET")
    lines.append("  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,")
    lines.append("  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,")
    lines.append("  verification_status = EXCLUDED.verification_status;")
    lines.append("")

lines.append("-- ----------------------------------------------------------------------------")
lines.append("-- Fattori di ritenzione di cottura (retention_factors)")
lines.append("--")
lines.append("-- Fusi qui 2026-10-10 da 4 file sparsi (retention_factors_legumi_tuberi.sql,")
lines.append("-- retention_factors_crucifere.sql, retention_factors_padella.sql,")
lines.append("-- fix_sources_e_retention_factors.sql) + il fattore latte di")
lines.append("-- golden_set_raw_baselines.sql -- stessi valori, stesse fonti, stesso")
lines.append("-- verification_status di quei file, nessun numero nuovo. L'ON CONFLICT DO")
lines.append("-- UPDATE qui sotto corregge anche una riga live che un controllo incrociato")
lines.append("-- ha trovato senza fonte (leafy_greens/boiled/vitamin_c = 0.50/NULL invece")
lines.append("-- di 0.58/USDA_RETN06 -- vedi commento su RETENTION_FACTORS in questo script")
lines.append("-- per il dettaglio completo). Altre 3 righe trovate live senza fonte in")
lines.append("-- quello stesso controllo (leafy_greens/steamed/vitamin_c,")
lines.append("-- legumes/boiled/phytates, pome_fruits/steamed/polyphenols) NON hanno un")
lines.append("-- sostituto sourced e vanno rimosse a parte (DELETE, non INSERT con un")
lines.append("-- valore indovinato) -- non presenti qui.")
lines.append("-- ----------------------------------------------------------------------------")
lines.append("INSERT INTO retention_factors (matrix_id, cooking_method, nutrient, value, confidence_low, confidence_high, source_id, verification_status) VALUES")
rf_rows = []
for rf in RETENTION_FACTORS:
    rf_rows.append(
        f"  ({sql_str(rf['matrix_id'])}, {sql_str(rf['cooking_method'])}, {sql_str(rf['nutrient'])}, "
        f"{sql_num(rf['value'])}, {sql_num(rf.get('confidence_low'))}, {sql_num(rf.get('confidence_high'))}, "
        f"{sql_str(rf['source_id'])}, {sql_str(rf['verification_status'])})"
    )
lines.append(",\n".join(rf_rows))
lines.append("ON CONFLICT (matrix_id, cooking_method, nutrient) DO UPDATE SET")
lines.append("  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,")
lines.append("  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,")
lines.append("  verification_status = EXCLUDED.verification_status;")
lines.append("")

# Explicit documented gaps (no SQL effect, just comments for the record)
lines.append("-- ----------------------------------------------------------------------------")
lines.append("-- Gap dichiarati in questo giro di popolamento (NON inseriti, per onesta'):")
lines.append("-- ----------------------------------------------------------------------------")
lines.append("-- - food_lentils_boiled.phytates_mg: trovato un valore SOLO per lenticchie")
lines.append("--   CRUDE/secche (233.04 mg/100g, Fouad AA, Rehab FMA. Acta Sci Pol Technol")
lines.append("--   Aliment. 2015;14(3):233-246), non per bollite -- stato di cottura non")
lines.append("--   corrispondente al food_id di questa riga. Non inserito.")
lines.append("-- - food_spinach_raw.oxalates_mg: RISOLTO 2026-10-10 (vedi")
lines.append("--   fix_literature_sources_recheck.sql). Due fonti discordanti --")
lines.append("--   Noonan & Savage 1999 (review, 970 mg/100g) vs Siener et al. 2006")
lines.append("--   (studio primario dedicato, 1959 mg/100g) -- l'utente ha scelto")
lines.append("--   esplicitamente Siener (piu' recente, studio primario vs review).")
lines.append("--   Resta 'draft': il testo completo di Siener e' a pagamento, non letto")
lines.append("--   direttamente da Claude (citazione di seconda mano).")
lines.append("-- - food_kale_raw: selenium_mcg, vitamin_k_mcg, vitamin_b12_mcg non recuperati")
lines.append("--   (fetch troncato in questa sessione, non necessariamente assenti dalla")
lines.append("--   fonte) -- da ri-tentare in una sessione futura.")
lines.append("-- - food_milk_whole: solo calcium_mg confermato (stesso motivo: fetch troncato")
lines.append("--   su un record molto verboso) -- iron/zinc/vitC/magnesium/copper/selenium/")
lines.append("--   vitamin_k/vitamin_b12/folate da ri-tentare.")
lines.append("-- - Nessun alimento fortificato con acido folico (es. cereali da colazione)")
lines.append("--   e' stato inserito in questo giro: le pagine FDC dei candidati individuati")
lines.append("--   (Kellogg's Corn Flakes, NDB 08020) non sono state raggiungibili in questa")
lines.append("--   sessione -- is_fortified_folate resta quindi non esercitato da un alimento")
lines.append("--   reale nel Golden Set (solo da test sintetici).")
lines.append("-- - macs_mg, polyphenols_mg: non ricercati in questo giro per nessuno dei 13")
lines.append("--   alimenti (richiederebbero rispettivamente dati tipo Sonnenburg 2016 o un")
lines.append("--   database come Phenol-Explorer, non ancora consultati per questi alimenti")
lines.append("--   specifici) -- gap preesistente, non introdotto ora.")
lines.append("-- - iodine_mcg: non trovato per NESSUNO dei 19 alimenti (USDA FDC non riporta")
lines.append("--   lo iodio per la maggior parte delle voci standard) -- confirma il gap gia'")
lines.append("--   dichiarato in docs/PRD.md §4.0/§4.5.")
lines.append("-- - food_broccoli_boiled: RISOLTO 2026-10-10 -- trovato FDC ID 169967")
lines.append("--   (confermato fresco, non surgelato: il nome del record non contiene")
lines.append("--   'frozen', a differenza delle voci surgelate che lo dichiarano")
lines.append("--   esplicitamente). Vedi la scheda FOODS sopra.")
lines.append("-- - food_chickpeas_boiled.vitamin_b12_mcg: il record FDC segnala esplicitamente")
lines.append("--   0 data points per questo campo (diverso dal B12=0.00 con dati reali a")
lines.append("--   supporto degli altri alimenti vegetali di questo set) -- inserito comunque")
lines.append("--   come 0.00/USDA_FDC per coerenza biologica (i legumi non contengono B12),")
lines.append("--   ma il limite metodologico specifico di questo record resta dichiarato qui.")
lines.append("-- - food_milk_whole.fiber_g: fonte verificata per lo stesso FDC ID 322892")
lines.append("--   internamente contraddittoria sulla fibra (etichetta \"not declared\" / riquadro")
lines.append("--   \"0g\" / nessuna riga \"Fiber\" nella tabella nutrienti completa) -- non inserito,")
lines.append("--   anche se biologicamente il latte ha fibra ~0. Aggiunto 2026-10-10 insieme")
lines.append("--   agli altri macronutrienti (energy_kcal/protein_g/fat_g/carbohydrates_g),")
lines.append("--   verificati via getfoodfacts.com (mirror USDA FDC con stesso FDC ID citato")
lines.append("--   esplicitamente in pagina) perché fdc.nal.usda.gov non era raggiungibile")
lines.append("--   direttamente in questa sessione.")
lines.append("-- - food_pasta_enriched_cooked.folate_mcg: contiene SOLO la quota di acido")
lines.append("--   folico sintetico (66 µg), non il folato totale (73 µg) né la quota di")
lines.append("--   folato alimentare naturale (7 µg) riportati entrambi dal record FDC --")
lines.append("--   coerente con la semantica a singolo-campo di calculateFolateDFE (vedi")
lines.append("--   commento Python in FOODS), ma la quota naturale resta cosi' non")
lines.append("--   rappresentata in questa riga. Primo alimento reale a rendere visibile")
lines.append("--   questo limite preesistente dello schema (prima solo su dati sintetici).")
lines.append("--")
lines.append("-- Gap dichiarati aggiunti 2026-10-10 (secondo giro, i 9 nuovi baseline crudi):")
lines.append("-- - food_potato_raw, food_kidney_beans_raw, food_lentils_raw,")
lines.append("--   food_chickpeas_raw: phytates_mg, oxalates_mg non nel profilo SR Legacy")
lines.append("--   standard consultato per questi FDC ID -- non ricercati da fonti di")
lines.append("--   letteratura dedicate in questo giro (diversamente da spinaci/kale/fagioli")
lines.append("--   rossi bolliti sopra), da fare in una sessione futura se servono.")
lines.append("-- - food_chickpeas_raw.selenium_mcg: la fonte mostra 0 µg ma il subagent non")
lines.append("--   e' riuscito a confermarlo come zero dichiarato con dati a supporto")
lines.append("--   piuttosto che campo assente -- per cautela NON inserito (diversamente dal")
lines.append("--   B12, dove food_chickpeas_boiled accetta gia' questa stessa ambiguita' per")
lines.append("--   coerenza biologica).")
lines.append("-- - food_salmon_raw.folate_mcg: non riportato dalla fonte (FDC 175167) per")
lines.append("--   questo FDC ID.")
lines.append("-- - carote, broccoli: RISOLTO 2026-10-10 (quarto giro). Nessuna riga")
lines.append("--   food-specifica in USDA Retention Factors Release 6 ne' in letteratura")
lines.append("--   dedicata (vedi ricerca precedente, Masrizal 1997/Viroli 2023 non")
lines.append("--   utilizzabili). Decisione esplicita dell'utente (chat, 2026-10-10): dove")
lines.append("--   manca un fattore pubblicato ma esistono due alimenti Golden Set misurati")
lines.append("--   indipendentemente da USDA FDC per la stessa matrice (crudo + gia' cotto),")
lines.append("--   il fattore di ritenzione si DERIVA come rapporto fra le due misure reali")
lines.append("--   (vedi DERIVED_FDC_RAW_COOKED_RATIO in SOURCES_NEW e le righe 'broccoli'/")
lines.append("--   'carrots' in RETENTION_FACTORS) invece di lasciare solo 'Crudo' nel")
lines.append("--   selettore di cottura. food_carrots_boiled e food_broccoli_boiled restano")
lines.append("--   nel Golden Set (draft, non promossi, non mostrati nella Dispensa) solo")
lines.append("--   come base di calcolo tracciabile di questi rapporti. Non copre")
lines.append("--   beta-carotene/altri carotenoidi provitaminici A (gestiti da")
lines.append("--   carotenoid_matrix_state, vedi fix nel motore -- applicarci sopra anche")
lines.append("--   questo rapporto conterebbe due volte lo stesso effetto). Le mandorle")
lines.append("--   restano senza controparte cotta per scelta (non e' un alimento")
lines.append("--   tipicamente bollito) -- nessun gap da risolvere per quella matrice.")
lines.append("")

sql_text = "\n".join(lines)
out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "golden_set_foods.sql")
with open(out_path, "w") as f:
    f.write(sql_text)

print(f"Scritte {len(FOODS)} schede alimento.")
print(f"Totale righe nutrient_values: {sum(len(f['values']) + len(f.get('extra', {})) for f in FOODS)}")
print(f"Totale righe retention_factors: {len(RETENTION_FACTORS)}")
# Sanity checks difensivi
for food in FOODS:
    for code, val in food["values"].items():
        assert val >= 0, f"{food['food_id']}: {code} negativo ({val})"
    if food["food_id"] in [f2["food_id"] for f2 in FOODS if f2 is not food]:
        raise AssertionError(f"food_id duplicato: {food['food_id']}")
ids = [f["food_id"] for f in FOODS]
assert len(ids) == len(set(ids)), "food_id duplicati trovati!"
print("Sanity check OK: nessun valore negativo, nessun food_id duplicato.")
