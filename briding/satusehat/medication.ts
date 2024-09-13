const dispense = (medication:any, pasien:any,practitioner:any)=>{
    return {
        "resourceType": "MedicationDispense",
        "identifier": [
          {
            "system": "http://sys-ids.kemkes.go.id/prescription/100028173",
            "use": "official",
            "value": medication.no_resep
          },
          {
            "system": "http://sys-ids.kemkes.go.id/prescription-item/100028173",
            "use": "official",
            "value": medication.kode_brng
          }
        ],
        "status": "completed",
        "category": {
          "coding": [
            {
              "system": "http://terminology.hl7.org/fhir/CodeSystem/medicationdispense-category",
              "code": "outpatient",
              "display": "Outpatient"
            }
          ]
        },
        "medicationReference": {
          "reference": `Medication/${medication.id_medication}`,
          "display": medication.obat_display
        },
        "subject": {
          "reference": `Patient/${pasien.entry[0].resource.id}`,
          "display": medication.nm_pasien
        },
        "context": {
          "reference": `Encounter/${medication.id_encounter}`
        },
        "performer": [
          {
            "actor": {
              "reference": `Practitioner/${practitioner.entry[0].resource.id}`,
              "display": medication.nama
            }
          }
        ],
        "location": {
          "reference": `Location/${medication.id_lokasi_satusehat}`,
          "display": medication.nm_bangsal
        },
        "authorizingPrescription": [{
            "reference": `MedicationRequest/${medication.id_medicationrequest}`
        }],
        "quantity": {
          "system": medication.denominator_system,
          "code": medication.denominator_code,
          "value": medication.jml
        },
        "whenPrepared": new Date(new Date(medication.tgl_peresepan).toLocaleDateString()+ " " + medication.jam_peresepan + 'Z'),
        "whenHandedOver": new Date(new Date(medication.tgl_perawatan).toLocaleDateString()+ " " + medication.jam + 'Z'),
        "dosageInstruction": [
          {
            "sequence": 1,
            "text": medication.aturan,
            "timing": {
              "repeat": {
                "frequency": 1,
                "period": 1,
                "periodUnit": "d"
              }
            },
            "route": {
              "coding": [
                {
                  "system": medication.route_system,
                  "code": medication.route_code,
                  "display": medication.route_display
                }
              ]
            },
            "doseAndRate": [
              {
                "doseQuantity": {
                  "value": 1,
                  "unit": medication.denominator_code,
                  "system": medication.denominator_system,
                  "code": medication.denominator_code
                }
              }
            ]
          }
        ]
      }
}

export default dispense