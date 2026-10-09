-- ============================================================================
-- Fattori di ritenzione: Crucifere (cavoletti di Bruxelles), bollitura e vapore
-- ============================================================================
--
-- Trovato questa notte (2026-10-09), colma uno dei buchi lasciati
-- esplicitamente aperti in retention_factors_legumi_tuberi.sql ("crucifere
-- e cottura a vapore NON trovati in USDA Release 6 né in Bognár").
--
-- Fonte: Doniec J, Florkiewicz A, Duliński R, Filipiak-Florkiewicz A.
-- "Impact of Hydrothermal Treatments on Nutritional Value and Mineral
-- Bioaccessibility of Brussels Sprouts (Brassica oleracea var. gemmifera)."
-- Molecules. 2022;27(6):1861. DOI 10.3390/molecules27061861. PMID 35335226.
-- Open access, full-text verificato (non solo abstract).
--
-- Metodologia: cavoletti di Bruxelles crudi (n=3 per trattamento), bolliti
-- 15 min a 98±1°C (rapporto materiale:acqua 1:3), oppure a vapore 7 min a
-- 100°C in combi steamer, fino a "consumable softness" (texturometro).
-- Minerali per spettrometria ad assorbimento atomico a fiamma, dopo
-- digestione a microonde in acido nitrico.
--
-- IMPORTANTE: il ferro NON mostra differenza statisticamente significativa
-- tra crudo/bollito/vapore (stessa lettera "a" nel paper) -- quindi il
-- fattore di ritenzione ferro resta 1.00 (nessuna variazione dimostrata),
-- NON i rapporti grezzi che si calcolerebbero dai valori medi (che
-- sarebbero >1.0 per puro rumore statistico su n=3). Lo zinco invece mostra
-- una perdita statisticamente significativa.

insert into sources (id, citation, url, source_type, retrieved_date) values
  ('DONIEC_2022_MOLECULES',
   'Doniec J, Florkiewicz A, Duliński R, Filipiak-Florkiewicz A. Impact of Hydrothermal Treatments on Nutritional Value and Mineral Bioaccessibility of Brussels Sprouts (Brassica oleracea var. gemmifera). Molecules. 2022;27(6):1861.',
   'https://doi.org/10.3390/molecules27061861',
   'peer_reviewed_journal',
   current_date)
on conflict (id) do nothing;

-- Ferro: nessuna variazione significativa -> fattore 1.00 per entrambi i metodi
insert into retention_factors (matrix_id, cooking_method, nutrient, value, confidence_low, confidence_high, source_id, verification_status) values
  ('crucifere_cavoletti_bruxelles', 'boiled',  'iron', 1.00, null, null, 'DONIEC_2022_MOLECULES', 'verified'),
  ('crucifere_cavoletti_bruxelles', 'steamed', 'iron', 1.00, null, null, 'DONIEC_2022_MOLECULES', 'verified')
on conflict (matrix_id, cooking_method, nutrient) do update set
  value = excluded.value, confidence_low = excluded.confidence_low, confidence_high = excluded.confidence_high,
  source_id = excluded.source_id, verification_status = excluded.verification_status;

-- Zinco: perdita di massa significativa (18.78/21.47=0.78 bollito; 17.40/21.47=0.81 vapore)
insert into retention_factors (matrix_id, cooking_method, nutrient, value, confidence_low, confidence_high, source_id, verification_status) values
  ('crucifere_cavoletti_bruxelles', 'boiled',  'zinc', 0.78, null, null, 'DONIEC_2022_MOLECULES', 'verified'),
  ('crucifere_cavoletti_bruxelles', 'steamed', 'zinc', 0.81, null, null, 'DONIEC_2022_MOLECULES', 'verified')
on conflict (matrix_id, cooking_method, nutrient) do update set
  value = excluded.value, confidence_low = excluded.confidence_low, confidence_high = excluded.confidence_high,
  source_id = excluded.source_id, verification_status = excluded.verification_status;

-- ============================================================================
-- NOTA ARCHITETTURALE IMPORTANTE (non implementata, solo documentata):
-- lo stesso paper misura anche la BIOACCESSIBILITA' dello zinco (digestione
-- in vitro simulata), non solo la massa ritenuta:
--   crudo: 17.02 +/- 1.37%  |  vapore: 6.83 +/- 0.20%  |  bollito: 6.57 +/- 0.06%
-- Questo e' un calo MOLTO piu' grande (~60% relativo) di quanto il semplice
-- fattore di ritenzione di massa (0.78-0.81) suggerirebbe. Significa che
-- cucinare le crucifere non solo riduce la quantita' di zinco rimasta, ma
-- riduce ANCHE quanto di quello zinco rimasto e' realmente assorbibile --
-- un effetto che CookingTransformationEngine oggi non modella (applica
-- solo fattori di ritenzione di massa, non un secondo strato di
-- biodisponibilita' post-cottura). Per ora e' solo un limite dichiarato,
-- non un bug: implementarlo richiederebbe un nuovo campo/meccanismo e una
-- decisione esplicita, non una scelta unilaterale stanotte.
-- Fonte della nota: stesso paper, Tabella 5.
-- ============================================================================
