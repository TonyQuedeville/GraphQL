
async function apiFetch(rq){
    return fetch('https://zone01normandie.org/api/graphql-engine/v1/graphql', {
        method:"POST",

        headers: token && {
            Authorization: "Bearer " + token, // Ajout du JWT dans l'en-tête Authorization
            "Content-Type": "application/json",
            "Accept": "application/json",
        },

        body:JSON.stringify({
            query:rq,
        })
    })
    .then(response => response.json())
    .catch(error => {
        console.error('Erreur apiFetch() :', error);
    })
}

function getUser(){
    const rq = `
        query{
            user(where: {login : {_eq : ${login}}} ){
                id, 
                login,
                firstName,
                lastName,
            },
        }
    `
    const objUser = apiFetch(rq)
    objUser.then((infoUser)=> {
        // console.log(infoUser.data.user)
        userId = infoUser.data.user[0].id
        document.getElementById("login-password").style.display = "none"
        document.getElementById("logout").style.display = "flex"
        document.getElementById("chartLevel").style.display = "flex"
        document.getElementById("chartProgressXp").style.display = "flex"
        document.getElementById("chartRatioUpDown").style.display = "flex"
        document.getElementById("chartSkill").style.display = "flex"

        document.getElementById("login").value = infoUser.data.user[0].login
        document.getElementById("loginId").textContent = infoUser.data.user[0].id
        document.getElementById("firstName").textContent = infoUser.data.user[0].firstName
        document.getElementById("lastName").textContent = infoUser.data.user[0].lastName


        let limit = 200
        let offset = 0

        /* 
        const typeObject = "project" // "project" "exercise" "raid"
        const typeData = "xp" 
        "xp"
        "up" "down" "level" 
        "skill_prog"
        "skill_game"
        "skill_algo"
        "skill_ai"
        "skill_stats"
        "skill_tcp"
        "skill_unix"
        "skill_go" 
        "skill_js" 
        "skill_rust" 
        "skill_c" 
        "skill_python" ?
        "skill_php" ?
        "skill_ruby" ?
        "skill_sql" 
        "skill_html" 
        "skill_css" 
        "skill_docker" 
        "skill_back-end" 
        "skill_front-end" 
        "skill_sys-admin" 
        //*/
        getTransactionXp(userId, "project", limit, offset)
        getTransactionUpDown(userId, "project", limit, offset)
        getTransactionSkill(userId, "project", limit, offset)
        getTransactionLevel(userId, "project", limit, offset)
        //getProgress(userId, limit, offset)
        //getResults(userId, limit, offset)
        //getObject("project", limit, offset)
        //getObject("exercise", limit, offset)
    })
}

/* ------------------------------------------------------------------------------------------------ */

function getTransactionXp(id, typeObject, limit, offset){
    let rq = `
    query{
        transaction(where: {
                            userId : {_eq : ${id}}, 
                            type : {_eq : "xp"}, 
                            object : {type : {_eq : ${typeObject}}}
                            }, 
                            limit: ${limit}, 
                            offset: ${offset}, 
                            order_by : {createdAt : asc}
                        ) { 
                type,
                amount,
                object{
                    id,
                    name,
                    type
                },
                createdAt,
                path,
            },
        }
    `

    const objTransction = apiFetch(rq)
    objTransction.then((infos)=> {
        for(let info of infos.data.transaction){
            TransactionsXp.push(info)
        }
        const len = infos.data.transaction.length
        offset += limit

        if(len == limit){
            getTransactionXp(userId, typeObject, limit, offset)
        } else {           
            TransactionsXp = detecterDoublons(TransactionsXp)
            cumulXp = cumulMegaXp(TransactionsXp)
            //console.log("cumulXp : ", cumulXp)
            createChart("ProgressXp", "Progression xp par " + typeObject)
            createGraphPoint("ProgressXp", cumulXp, "cumul", typeObject, "Xp (kB)")

            const a = () =>{
                createChart("ProgressXp", "Progression xp par " + typeObject)
                createGraphPoint("ProgressXp", cumulXp, "cumul", typeObject, "Xp (kB)")
            }
            window.addEventListener('resize', a)
            //window.removeEventListener('resize', a)
        }
    })
}

/* ------------------------------------------------------------------------------------------------ */

function getTransactionUpDown(id, typeObject, limit, offset){
    const rq = `query{
                    transaction(where: {
                                        userId : {_eq : ${id}}, 
                                        _or: [{type: {_eq: "up"}}, {type: {_eq: "down"}}], 
                                        object : {type : {_eq : ${typeObject}}}
                                        }, 
                                        limit: ${limit}, 
                                        offset: ${offset}, 
                                        order_by : {createdAt : asc}
                                    ) { 
                            type,
                            amount,
                            object{
                                id,
                                name,
                                type
                            },
                            createdAt,
                            path,
                        },
                    }
                `

    const objTransction = apiFetch(rq)
    objTransction.then((infos)=> {
        for(let info of infos.data.transaction){
            TransactionsUpDown.push(info)
        }
        const len = infos.data.transaction.length
        offset += limit

        if(len == limit){
            getTransactionUpDown(userId, typeObject, limit, offset)
        } else {  
            //console.log("TransactionsUpDown:", TransactionsUpDown);
            cumulUpDown = cumulRatioXp(TransactionsUpDown)
            //console.log("cumulUpDown : ", cumulUpDown)
            createChart("RatioUpDown", "Ratio audit par " + typeObject)
            createGraphPoint("RatioUpDown", cumulUpDown, "cumul", typeObject, "Xp (kB)")

            const b = () =>{
                createChart("RatioUpDown", "Ratio audit par " + typeObject)
                createGraphPoint("RatioUpDown", cumulUpDown, "cumul", typeObject, "Xp (kB)")
            }
            window.addEventListener('resize', b)
        }
    })
}

/* ------------------------------------------------------------------------------------------------ */

function getTransactionSkill(id, typeObject, limit, offset){
    const rq = `query{
                transaction(where: {
                            userId : {_eq : ${id}},
                            type: {_ilike: "skill_%"}
                            }, 
                            limit: ${limit}, 
                            offset: ${offset}, 
                            order_by : {createdAt : asc}
                        ) { 
                type,
                amount,
                object{
                    id,
                    name,
                    type
                },
                createdAt,
                path,
            },
        }
    `

    const objTransction = apiFetch(rq)
    objTransction.then((infos)=> {
        for(let info of infos.data.transaction){
            TransactionsSkill.push(info)
        }
        const len = infos.data.transaction.length
        offset += limit

        if(len == limit){
            getTransactionSkill(userId, typeObject, limit, offset)
        } else {  
            //console.log("TransactionsSkill:", TransactionsSkill);
            cumulSkill = maxiSkills(TransactionsSkill)
            //console.log("cumulskill : ", cumulSkill)
            createChart("Skill", "Skill")
            createGraphBar("Skill", cumulSkill)

            const b = () =>{
                createChart("Skill", "Skill")
                createGraphBar("Skill", cumulSkill)
            }
            window.addEventListener('resize', b)
        }
    })
}

/* ------------------------------------------------------------------------------------------------ */

function getTransactionLevel(id, typeObject, limit, offset){
    const rq = `query{
                transaction(where: {
                            userId : {_eq : ${id}},
                            type: {_eq : "level"},
                            object : {type : {_eq : ${typeObject}}}
                            }, 
                            limit: ${limit}, 
                            offset: ${offset}, 
                            order_by : {createdAt : asc}
                        ) { 
                type,
                amount,
                object{
                    id,
                    name,
                    type
                },
                createdAt,
                path,
            },
        }
    `

    const objTransction = apiFetch(rq)
    objTransction.then((infos)=> {
        
        for(let info of infos.data.transaction){
            TransactionsLevel.push(info)
        }
        const len = infos.data.transaction.length
        offset += limit
        
        if(len == limit){
            getTransactionLevel(userId, typeObject, limit, offset)
        } else {  
            //console.log("TransactionsLevel:", TransactionsLevel);
            level= maxiLevel(TransactionsLevel)
            //console.log("level : ", level)
            createChart("Level", "Level", "height", 35)
            createGraphLevel("Level", level)

            const b = () =>{
                createChart("Level", "Level", "height", 35)
                createGraphLevel("Level", level)
            }
            window.addEventListener('resize', b)
        }
    })
}

/*----------------------------------------------------------------------------------------------------------*/

/*function getProgress(id, limit, offset){
    const rq = `
        query{
            progress(where: {userId : {_eq : ${id}}}, limit: ${limit}, offset: ${offset}) { 
                objectId,
                grade,
                createdAt,
                updatedAt,
                path
            },
        }
    `
    const objProgress = apiFetch(rq,token)
    objProgress.then((infos)=> {
        //console.log("Progress:", infos.data.progress.length, ":", infos.data.progress)
        for(let info of infos.data.progress){
            Progresss.push(info)
        }
        const len = infos.data.progress.length
        offset += limit

        if(len == limit){
            getProgress(userId, limit, offset)
        } else {
            console.log("Progress:", Progresss);
        }
    })
}

function getResults(id, limit, offset){
    const rq = `
        query{
            result(where: {userId : {_eq : ${id}}}, limit: ${limit}, offset: ${offset}) { 
                objectId,
                grade,
                type,
                createdAt,
                updatedAt,
                path
            },
        }
    `
    const objResults = apiFetch(rq,token)
    objResults.then((infos)=> {
        for(let info of infos.data.result){
            Results.push(info)
        }
        //console.log("Results:", infos.data.result.length, ":", infos.data.result)
        const len = infos.data.result.length
        offset += limit

        if(len == limit){
            getResults(userId, limit, offset)
        } else {
            console.log("Results:", Results);
        }
    })
}

function getObject(type, limit, offset){
    const rq = `
        query{
            object(where: {type : {_eq : ${type}}}, limit: ${limit}, offset: ${offset}) { 
                id,
                name,
                type,
                childrenAttrs,
            },
        }
    `
    const objObject = apiFetch(rq,token)
    objObject.then((infos)=> {
        for(let info of infos.data.object){
            if(type == "project"){
                ObjectProjects.push(info)
            }
            if(type == "exercise"){
                ObjectExercises.push(info)
            }
            
        }
        //console.log("Object " + type + "s:", infos.data.object.length, ":", infos.data.object)
        const len = infos.data.object.length
        offset += limit

        if(len == limit){
            getObject(type, limit, offset)
        } else {
            if(type == "project"){
                console.log("Object " + type + "s:", ObjectProjects);
            }
            if(type == "exercise"){
                console.log("Object " + type + "s:", ObjectExercises);
            }
        }
    })
}
//*/