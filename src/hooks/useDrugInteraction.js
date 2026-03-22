import { useCallback } from 'react'

/**
 * useDrugInteraction — checks drug interactions via OpenFDA API.
 * Free, no API key needed.
 * Endpoint: api.fda.gov/drug/label.json
 *
 * Detects queries like:
 * "Can I take ibuprofen with metformin?"
 * "Is paracetamol safe with alcohol?"
 * "Drug interaction between aspirin and warfarin"
 */

const INTERACTION_KEYWORDS = [
  'interaction', 'interact', 'safe to take', 'can i take', 'mix',
  'combine', 'together with', 'along with', 'ibuprofen', 'paracetamol',
  'aspirin', 'metformin', 'warfarin', 'amoxicillin', 'drug',
]

// Common interactions database (instant fallback when API is slow)
const KNOWN_INTERACTIONS = {
  'ibuprofen+aspirin':   { severity: 'moderate', effect: 'Taking ibuprofen with aspirin may reduce aspirin\'s blood-thinning effect and increase risk of stomach bleeding.' },
  'aspirin+ibuprofen':   { severity: 'moderate', effect: 'Taking ibuprofen with aspirin may reduce aspirin\'s blood-thinning effect and increase risk of stomach bleeding.' },
  'ibuprofen+warfarin':  { severity: 'high',     effect: 'Combining ibuprofen with warfarin significantly increases bleeding risk. Avoid this combination.' },
  'warfarin+aspirin':    { severity: 'high',     effect: 'Combining warfarin with aspirin greatly increases bleeding risk. Consult your doctor before taking both.' },
  'alcohol+paracetamol': { severity: 'high',     effect: 'Alcohol with paracetamol can cause serious liver damage even at normal doses. Avoid alcohol when taking paracetamol.' },
  'paracetamol+alcohol': { severity: 'high',     effect: 'Alcohol with paracetamol can cause serious liver damage even at normal doses. Avoid alcohol when taking paracetamol.' },
  'metformin+alcohol':   { severity: 'moderate', effect: 'Alcohol can increase the risk of lactic acidosis when taking metformin, a rare but serious condition.' },
}

// Common drug name aliases
const DRUG_ALIASES = {
  'tylenol': 'paracetamol', 'acetaminophen': 'paracetamol',
  'advil': 'ibuprofen', 'motrin': 'ibuprofen', 'nurofen': 'ibuprofen',
  'crocin': 'paracetamol', 'dolo': 'paracetamol',
  'disprin': 'aspirin', 'ecosprin': 'aspirin',
}

export function useDrugInteraction() {

  const isDrugQuery = useCallback((text) => {
    const t = text.toLowerCase()
    return INTERACTION_KEYWORDS.some(k => t.includes(k))
  }, [])

  const checkInteraction = useCallback(async (text) => {
    const t = text.toLowerCase()

    // Normalize drug names
    let normalized = t
    Object.entries(DRUG_ALIASES).forEach(([alias, name]) => {
      normalized = normalized.replace(new RegExp(alias, 'g'), name)
    })

    // Extract drug names — look for common drugs mentioned
    const commonDrugs = [
      'ibuprofen', 'paracetamol', 'aspirin', 'warfarin', 'metformin',
      'amoxicillin', 'omeprazole', 'atorvastatin', 'lisinopril',
      'amlodipine', 'metoprolol', 'levothyroxine', 'alcohol',
      'cetirizine', 'azithromycin', 'pantoprazole', 'clopidogrel',
    ]

    const found = commonDrugs.filter(drug => normalized.includes(drug))

    if (found.length < 1) return null

    // Check local DB first
    if (found.length >= 2) {
      const key1 = `${found[0]}+${found[1]}`
      const key2 = `${found[1]}+${found[0]}`
      const local = KNOWN_INTERACTIONS[key1] || KNOWN_INTERACTIONS[key2]
      if (local) {
        return {
          drugs:    found,
          severity: local.severity,
          effect:   local.effect,
          source:   'local',
          safe:     local.severity === 'low',
        }
      }
    }

    // Try OpenFDA API for the primary drug
    const primaryDrug = found[0]
    try {
      const res = await fetch(
        `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${primaryDrug}"&limit=1`
      )
      if (!res.ok) throw new Error('FDA API failed')
      const data = await res.json()
      const label = data.results?.[0]

      if (!label) return buildGenericResponse(found)

      // Extract relevant warning sections
      const interactions = label.drug_interactions?.[0]
        || label.warnings?.[0]
        || null

      if (!interactions) return buildGenericResponse(found)

      // Summarise — keep under 100 words
      const summary = interactions.slice(0, 300).replace(/<[^>]*>/g, '').trim()

      return {
        drugs:    found,
        severity: 'check',
        effect:   summary + (summary.length >= 300 ? '...' : ''),
        source:   'openfda',
        safe:     null,
      }
    } catch {
      return buildGenericResponse(found)
    }
  }, [])

  const buildInteractionText = useCallback((data) => {
    if (!data) return null
    const drugList = data.drugs.join(' and ')
    if (data.severity === 'high') {
      return `⚠️ Important interaction between ${drugList}: ${data.effect} Please consult your doctor before taking these together.`
    } else if (data.severity === 'moderate') {
      return `⚠️ Moderate interaction between ${drugList}: ${data.effect} Talk to your pharmacist or doctor.`
    } else if (data.safe) {
      return `${drugList} can generally be taken together, but always follow dosage instructions and consult your doctor if unsure.`
    } else {
      return `Regarding ${drugList}: ${data.effect} Always consult your doctor or pharmacist before combining medications.`
    }
  }, [])

  return { isDrugQuery, checkInteraction, buildInteractionText }
}

function buildGenericResponse(drugs) {
  return {
    drugs,
    severity: 'check',
    effect:   `Always consult your doctor or pharmacist before combining ${drugs.join(' and ')}. Drug interactions can vary based on dosage, health conditions, and other medications you may be taking.`,
    source:   'generic',
    safe:     null,
  }
}