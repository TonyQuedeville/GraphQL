let rq = ``
let userId = 0
let TransactionsLevel = []
let level = []
let TransactionsXp = []
let cumulXp = []
let TransactionsUpDown = []
let cumulUpDown = []
let TransactionsSkill = []
let cumulSkill = []
let Progresss = []
let Results = []
let ObjectProjects = []
let ObjectExercises = []

// Jeton d'accés à Zone 01
let login = ""
let password = ""
let token = ""

document.getElementById("logout").addEventListener("click", e => {
    window.location.reload()
    localStorage.clear()
    // document.getElementById("login-password").hidden = false
})

document.getElementById("login").addEventListener("change", e => {
    login = e.target.value
    password = document.getElementById("password").value
    if(password != ""){
        //console.log("password !", password, "login !", login);
        response = getLogin(login, password)
        // console.log(response)
        .then(data =>{
            token = data;
            //console.log("token:", token);
            localStorage.setItem('token', token);
            getUser()
        })
        .catch(error => {
            console.error('Erreur response Login :', error)
        })
    }
})

document.getElementById("password").addEventListener("change", e => {
    password = e.target.value
    login = document.getElementById("login").value
    if(login != ""){
        //console.log("password !", password, "login !", login);
        response = getLogin(login, password)
        .then(data =>{
            if(data.error != undefined){
                alert("error login or password !");
                createChart("Level", "", 0, 0)
                createChart("ProgressXp", "", 0, 0)
                createChart("RatioUpDown", "", 0, 0)
                createChart("Skill", "", 0, 0)
            } else {
                token = data;
                // console.log("token:", token);
                localStorage.setItem('token', token);
                getUser()
            }
        })
        .catch(error => {
            console.error('Erreur response Login :', error)
        })
    }
})

/* -------------------------------------------------------------------------------------*/

async function getLogin(login, password) {
    let encoded = btoa(login + ":" + password)

    // Solution de contournement : https://cors-anywhere.herokuapp.com/
    return fetch('https://zone01normandie.org/api/auth/signin', {
    method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${encoded}`
        },
    })
    .then(response => response.json())
    .catch(error => {
        console.error('Erreur response Login :', error)
    })
}

/* -------------------------------------------------------------------------------------*/

function detecterDoublons(tableau) {
    let result = []
    
    for (let i = 0; i < tableau.length; i++) {
        let element = tableau[i]
        //console.log("element object.type:", element.object.type)
        
        let exists = false        
        for (let j = 0; j < result.length; j++) {
            if (element.path === result[j].path) {
                exists = true
                if (element.amount > result[j].amount) {
                    //console.log("element path:", element.path)
                    result[j] = element
                }
            break
            }
        }

        if (!exists) {
            result.push(element)
        }
    }

    // tri par date
    result.sort((el1,el2) => {
        const elDate1 = new Date(el1.createdAt)
        const elDate2 = new Date(el2.createdAt)
        if(elDate1 < elDate2) return -1
        if(elDate1 > elDate2) return 1
        return 0
    })
    
    return result
}

function cumulMegaXp(tableau){
    let cumul = 0
    let result = []

    for(let xp of tableau){
        xp.amount = Math.round(xp.amount/1000)
        cumul = cumul + xp.amount
        xp.cumul = cumul
        result.push(xp)
    }

    return result
}

function cumulRatioXp(tableau){
    let cumulUp = 0
    let cumulDown = 0
    let cumul = 1
    let result = []

    for(let xp of tableau){
        if(xp.type == "up"){
            xp.amount = Math.round(xp.amount/1000)
            cumulUp = cumulUp + xp.amount
            xp.cumulUp = cumulUp
        }
        if(xp.type == "down"){
            xp.amount = Math.round(xp.amount/1000)
            cumulDown = cumulDown + xp.amount
            xp.cumulDown = cumulDown
        }
        
        if(cumulDown != 0 && cumulUp != 0) { // Evite la division / 0 et resultat infini
            cumul = cumulUp / cumulDown
        }
        xp.cumul = parseFloat(Number.parseFloat(cumul).toFixed(2))
        result.push(xp)
    }

    return result
}

function maxiSkills(tableau){
    //console.log(tableau);
    let obj = {}

    for(const {type, amount, ...autre} of tableau){
        // "type" -> clé
        // "amount" -> valeur
        // ""...autre" designe toutes les autres propriétés de l'élément du tableau

        if (obj.hasOwnProperty(type)) { // cumul amount si type existe déjà
            if(amount > obj[type].cumul) obj[type].cumul = amount;
        } else { // ajout du type si type n'existe pas avec initialisation du champ cumul
            obj[type] = {cumul: amount, ...autre};
        }
    }

    return obj
}

function maxiLevel(tableau){
    //console.log(tableau);
    let obj = {}

    for(const {type, amount,} of tableau){
        // "type" -> clé
        // "amount" -> valeur
        // ""...autre" designe toutes les autres propriétés de l'élément du tableau

        if (obj.hasOwnProperty(type)) { // cumul amount si type existe déjà
            if(amount > obj[type].amount) obj[type].amount = amount;
        } else { // ajout du type si type n'existe pas avec initialisation du champ cumul
            obj[type] = {amount};
        }
    }

    return obj
}