import { Elysia } from 'elysia'
import execute from './config/database'
import { fetchToken } from './briding/satusehat/auth'
import dispense from './briding/satusehat/medication';

new Elysia()
    .get('/', async ({query}:any) => {
        let result:any = [];

        try {
            const params = [query.tanggal,query.tanggal]
            const hasil = await execute(`
                select 
      reg_periksa.tgl_registrasi, 
      reg_periksa.jam_reg, 
      reg_periksa.no_rawat, 
      reg_periksa.no_rkm_medis, 
      pasien.nm_pasien, 
      pasien.no_ktp, 
      pegawai.nama, 
      pegawai.no_ktp as ktppraktisi, 
      satu_sehat_encounter.id_encounter, 
      satu_sehat_mapping_obat.obat_code, 
      satu_sehat_mapping_obat.obat_system, 
      detail_pemberian_obat.kode_brng, 
      satu_sehat_mapping_obat.obat_display, 
      satu_sehat_mapping_obat.form_code, 
      satu_sehat_mapping_obat.form_system, 
      satu_sehat_mapping_obat.form_display, 
      satu_sehat_mapping_obat.route_code, 
      satu_sehat_mapping_obat.route_system, 
      satu_sehat_mapping_obat.route_display, 
      satu_sehat_mapping_obat.denominator_code, 
      satu_sehat_mapping_obat.denominator_system, 
      resep_obat.tgl_peresepan, 
      resep_obat.jam_peresepan, 
      detail_pemberian_obat.jml, 
      satu_sehat_medication.id_medication, 
      aturan_pakai.aturan, 
      resep_obat.no_resep, 
      ifnull(
        satu_sehat_medicationdispense.id_medicationdispanse, 
        ''
      ) as id_medicationdispanse, 
      detail_pemberian_obat.no_batch, 
      detail_pemberian_obat.no_faktur, 
      detail_pemberian_obat.tgl_perawatan, 
      detail_pemberian_obat.jam, 
      satu_sehat_mapping_lokasi_depo_farmasi.id_lokasi_satusehat, 
      bangsal.nm_bangsal,
      satu_sehat_medicationrequest.id_medicationrequest
    from 
      reg_periksa 
      inner join pasien on reg_periksa.no_rkm_medis = pasien.no_rkm_medis 
      inner join resep_obat on reg_periksa.no_rawat = resep_obat.no_rawat 
      inner join pegawai on resep_obat.kd_dokter = pegawai.nik 
      inner join satu_sehat_encounter on satu_sehat_encounter.no_rawat = reg_periksa.no_rawat 
      inner join detail_pemberian_obat on detail_pemberian_obat.no_rawat = resep_obat.no_rawat 
      and detail_pemberian_obat.tgl_perawatan = resep_obat.tgl_perawatan 
      and detail_pemberian_obat.jam = resep_obat.jam 
      inner join aturan_pakai on detail_pemberian_obat.no_rawat = aturan_pakai.no_rawat 
      and detail_pemberian_obat.tgl_perawatan = aturan_pakai.tgl_perawatan 
      and detail_pemberian_obat.jam = aturan_pakai.jam 
      and detail_pemberian_obat.kode_brng = aturan_pakai.kode_brng 
      inner join satu_sehat_mapping_obat on satu_sehat_mapping_obat.kode_brng = detail_pemberian_obat.kode_brng 
      inner join bangsal on bangsal.kd_bangsal = detail_pemberian_obat.kd_bangsal 
      inner join satu_sehat_mapping_lokasi_depo_farmasi on satu_sehat_mapping_lokasi_depo_farmasi.kd_bangsal = bangsal.kd_bangsal 
      inner join satu_sehat_medication on satu_sehat_medication.kode_brng = satu_sehat_mapping_obat.kode_brng 
      inner join nota_jalan on nota_jalan.no_rawat = reg_periksa.no_rawat 
      left join satu_sehat_medicationrequest on resep_obat.no_resep = satu_sehat_medicationrequest.no_resep and detail_pemberian_obat.kode_brng = satu_sehat_medicationrequest.kode_brng
      left join satu_sehat_medicationdispense on satu_sehat_medicationdispense.no_rawat = detail_pemberian_obat.no_rawat 
      and satu_sehat_medicationdispense.tgl_perawatan = detail_pemberian_obat.tgl_perawatan 
      and satu_sehat_medicationdispense.jam = detail_pemberian_obat.jam 
      and satu_sehat_medicationdispense.kode_brng = detail_pemberian_obat.kode_brng 
      and satu_sehat_medicationdispense.no_batch = detail_pemberian_obat.no_batch 
      and satu_sehat_medicationdispense.no_faktur = detail_pemberian_obat.no_faktur 
      and satu_sehat_medicationdispense.id_medicationdispanse is null
    where 
      nota_jalan.tanggal between ? 
      and ?
                `,params)
       
            for (const medication of hasil) {
                const token = await fetchToken()
                const urlPasien = new URL(`https://api-satusehat.kemkes.go.id/fhir-r4/v1/Patient`);
                    urlPasien.searchParams.append('identifier', `https://fhir.kemkes.go.id/id/nik|${medication.no_ktp}`);
                const urlPractitioner = new URL(`https://api-satusehat.kemkes.go.id/fhir-r4/v1/Practitioner`);
                urlPractitioner.searchParams.append('identifier', `https://fhir.kemkes.go.id/id/nik|${medication.ktppraktisi}`);
                const urlDispense = new URL(`https://api-satusehat.kemkes.go.id/fhir-r4/v1/MedicationDispense`)

                const [pasien, practitioner] = await Promise.all([
                    fetch(urlPasien, { headers: { "Authorization": `Bearer ${token}` } }).then(res => res.json()),
                    fetch(urlPractitioner, { headers: { "Authorization": `Bearer ${token}` } }).then(res => res.json()),
                    // execute(`SELECT id_medicationrequest FROM satu_sehat_medicationrequest WHERE no_resep ='${medication.no_resep}' AND kode_brng = '${medication.kode_brng}'`)
                ]);

                if (pasien.entry !==undefined && practitioner.entry !==undefined && medication.id_medicationrequest !== null) {
                    const data = dispense(medication,pasien,practitioner)
                    fetch(urlDispense, { 
                        headers: { 
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        method:"POST",
                        body:JSON.stringify(data)
                    }).then(res => res.json()).then(result=>{
                        if(result.id){
                            console.log(`INSERT INTO satu_sehat_medicationdispense(no_rawat,tgl_perawatan,jam,kode_brng,no_batch,no_faktur,id_medicationdispense) values('${medication.no_rawat}','${new Date(medication.tgl_perawatan).toLocaleDateString('fr-CA')}','${medication.jam}','${medication.kode_brng}',${medication.no_batch},${medication.no_faktur},'${result.id}')`)
                            execute(`INSERT INTO satu_sehat_medicationdispense(no_rawat,tgl_perawatan,jam,kode_brng,no_batch,no_faktur,id_medicationdispanse) values('${medication.no_rawat}','${new Date(medication.tgl_perawatan).toLocaleDateString('fr-CA')}','${medication.jam}','${medication.kode_brng}','','','${result.id}')`)
                        }
                    })
                }
                await new Promise(resolve => setImmediate(resolve));
            }
            // console.log("ada ",result[0])
            return {status:"Ok", message:"sudah coba di kirim sebisanya"};
        } catch (error) {
            console.log(error)
        }
    })
    // .get('/user/:id', ({ params: { id }}) => id)
    // .post('/form', ({ body }) => body)
    .listen(5000)