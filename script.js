document.addEventListener("DOMContentLoaded", () => {

    let count = 0;

    const fideTable = [
        {min:0, max:3, H:0.50}, {min:4, max:10, H:0.51}, {min:11, max:17, H:0.52},
        {min:18, max:25, H:0.53}, {min:26, max:32, H:0.54}, {min:33, max:39, H:0.55},
        {min:40, max:46, H:0.56}, {min:47, max:53, H:0.57}, {min:54, max:61, H:0.58},
        {min:62, max:68, H:0.59}, {min:69, max:76, H:0.60}, {min:77, max:83, H:0.61},
        {min:84, max:91, H:0.62}, {min:92, max:98, H:0.63}, {min:99, max:106, H:0.64},
        {min:107, max:113, H:0.65}, {min:114, max:121, H:0.66}, {min:122, max:129, H:0.67},
        {min:130, max:137, H:0.68}, {min:138, max:145, H:0.69}, {min:146, max:153, H:0.70},
        {min:154, max:162, H:0.71}, {min:163, max:170, H:0.72}, {min:171, max:179, H:0.73},
        {min:180, max:188, H:0.74}, {min:189, max:197, H:0.75}, {min:198, max:206, H:0.76},
        {min:207, max:215, H:0.77}, {min:216, max:225, H:0.78}, {min:226, max:235, H:0.79},
        {min:236, max:245, H:0.80}, {min:246, max:255, H:0.81}, {min:256, max:267, H:0.82},
        {min:268, max:278, H:0.83}, {min:279, max:290, H:0.84}, {min:291, max:302, H:0.85},
        {min:303, max:315, H:0.86}, {min:316, max:328, H:0.87}, {min:329, max:344, H:0.88},
        {min:345, max:357, H:0.89}, {min:358, max:374, H:0.90}, {min:375, max:391, H:0.91},
        {min:392, max:411, H:0.92}, {min:412, max:432, H:0.93}, {min:433, max:456, H:0.94},
        {min:457, max:481, H:0.95}, {min:485, max:517, H:0.96}, {min:518, max:559, H:0.97},
        {min:560, max:619, H:0.98}, {min:620, max:735, H:0.99}, {min:736, max:3000, H:1.00},
    ];

    function fideExpectedScore(myElo, advElo) {
        let diff = Math.min(Math.abs(myElo - advElo), 400);
        for (let row of fideTable) {
            if (diff >= row.min && diff <= row.max) {
                return myElo >= advElo ? row.H : 1 - row.H;
            }
        }
    }

 function computeK(c, n, m, list2400, listFirst30, listBorn2300) {

    // PRIORITÉ 1 → 30 premières parties : K = 40
    if (listFirst30.includes(c)) return 40;

    // PRIORITÉ 2 → Avoir déjà eu 2300 (si né en 2007+)
    // prime sur la règle mineur
    if (listBorn2300.includes(c)) return 20;

    // PRIORITÉ 3 → Avoir déjà eu 2400
    if (list2400.includes(c)) return 10;

    // PRIORITÉ 4 → règles normales mineur / non mineur
    let baseK = m ? 40 : 20;

    if (n === 0) return baseK;

    return Math.max(10, Math.min(baseK, Math.floor(700 / n)));
}



    function updateCounts() {
        let rows = document.querySelectorAll("#tableParties tbody tr");
        let c = {classique:0, rapide:0, blitz:0};
        rows.forEach(r => c[r.querySelector(".cadence").value]++);
        nbClassique.textContent = c.classique;
        nbRapide.textContent = c.rapide;
        nbBlitz.textContent = c.blitz;
    }

    function addRow() {
        count++;
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${count}</td>
            <td><input type="number" class="eloAdv"></td>
            <td><select class="resultat"><option value="1">Victoire</option><option value="0.5">Nul</option><option value="0">Défaite</option></select></td>
            <td><select class="cadence"><option value="classique">Classique</option><option value="rapide">Rapide</option><option value="blitz">Blitz</option></select></td>
            <td class="E"></td>
            <td class="K"></td>
            <td class="delta"></td>
            <td class="eloApres"></td>
        `;
        tableParties.querySelector("tbody").appendChild(tr);
        tr.querySelectorAll("input,select").forEach(e => e.addEventListener("input", calculate));
        calculate();
    }

    function calculate() {
        updateCounts();

       let m = mineur.checked;
let list2400 = Array.from(document.querySelectorAll(".is2400:checked")).map(x => x.value);
let listFirst30 = Array.from(document.querySelectorAll(".first30:checked")).map(x => x.value);
let listBorn2300 = Array.from(document.querySelectorAll(".born2007_2300:checked")).map(x => x.value);

        let rows = document.querySelectorAll("#tableParties tbody tr");
        let countCad = {classique:0, rapide:0, blitz:0};
        rows.forEach(r => countCad[r.querySelector(".cadence").value]++);

      let kC = computeK("classique", countCad.classique, m, list2400, listFirst30, listBorn2300);
let kR = computeK("rapide", countCad.rapide, m, list2400, listFirst30, listBorn2300);
let kB = computeK("blitz", countCad.blitz, m, list2400, listFirst30, listBorn2300);


        kClassique.textContent = kC;
        kRapide.textContent = kR;
        kBlitz.textContent = kB;

        let base = {
            classique: parseInt(eloClassique.value) || 0,
            rapide: parseInt(eloRapide.value) || 0,
            blitz: parseInt(eloBlitz.value) || 0
        };

        let cur = {...base};

        rows.forEach(r => {
            let adv = parseInt(r.querySelector(".eloAdv").value);
            if (isNaN(adv)) return;

            let S = parseFloat(r.querySelector(".resultat").value);
            let cad = r.querySelector(".cadence").value;
            let K = cad === "classique" ? kC : cad === "rapide" ? kR : kB;

            let E = fideExpectedScore(base[cad], adv);

            r.querySelector(".E").textContent = E.toFixed(2);
            r.querySelector(".K").textContent = K;

            let d = Number((K * (S - E)).toFixed(2));
            r.querySelector(".delta").textContent = d.toFixed(1);

            cur[cad] += d;
            r.querySelector(".eloApres").textContent = Math.round(cur[cad]);
        });

        newEloClassique.textContent = Math.round(cur.classique);
        newEloRapide.textContent = Math.round(cur.rapide);
        newEloBlitz.textContent = Math.round(cur.blitz);
    }

    function resetTable() {
        tableParties.querySelector("tbody").innerHTML = "";
        count = 0;
        calculate();
    }

    /* rendre accessibles aux boutons HTML */
    window.addRow = addRow;
    window.resetTable = resetTable;

    /* listeners initiaux */
    eloClassique.addEventListener("input", calculate);
    eloRapide.addEventListener("input", calculate);
    eloBlitz.addEventListener("input", calculate);
    mineur.addEventListener("change", calculate);
    document.querySelectorAll(".is2400").forEach(cb => cb.addEventListener("change", calculate));
    document.querySelectorAll(".first30").forEach(cb => cb.addEventListener("change", calculate));
document.querySelectorAll(".born2007_2300").forEach(cb => cb.addEventListener("change", calculate));
});


